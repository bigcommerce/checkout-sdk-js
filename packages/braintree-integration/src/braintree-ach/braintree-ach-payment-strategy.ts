import {
    BraintreeInitializationData,
    BraintreeSdk,
    BraintreeUsBankAccount,
    BraintreeUsBankAccountDetails,
    isBraintreeError,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import {
    InvalidArgumentError,
    isHostedInstrumentLike,
    isVaultedInstrument,
    MissingDataError,
    MissingDataErrorType,
    NotInitializedError,
    NotInitializedErrorType,
    OrderFinalizationNotRequiredError,
    OrderPaymentRequestBody,
    OrderRequestBody,
    Payment,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentMethodFailedError,
    PaymentRequestOptions,
    PaymentStrategy,
    WithBankAccountInstrument,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import isUsBankAccountInstrumentLike from '../is-us-bank-account-instrument-like';

import { WithBraintreeAchPaymentInitializeOptions } from './braintree-ach-initialize-options';

export default class BraintreeAchPaymentStrategy implements PaymentStrategy {
    private usBankAccount?: BraintreeUsBankAccount;
    private getMandateText?: () => string;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private braintreeSdk: BraintreeSdk,
    ) {}

    async initialize(
        options: PaymentInitializeOptions & WithBraintreeAchPaymentInitializeOptions,
    ): Promise<void> {
        const { methodId, braintreeach } = options || {};

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.methodId" argument is not provided.',
            );
        }

        this.getMandateText = braintreeach?.getMandateText;

        await this.paymentIntegrationService.loadPaymentMethod(methodId);

        const state = this.paymentIntegrationService.getState();
        const paymentMethod = state.getPaymentMethodOrThrow<BraintreeInitializationData>(methodId);
        const { clientToken, initializationData } = paymentMethod;

        if (!clientToken || !initializationData) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        this.braintreeSdk.initialize(clientToken);

        try {
            this.usBankAccount = await this.braintreeSdk.getUsBankAccount();
        } catch (error) {
            this.handleBraintreeError(error);
        }
    }

    async execute(orderRequest: OrderRequestBody, options?: PaymentRequestOptions): Promise<void> {
        const { payment, ...order } = orderRequest;

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        const isSubmittingWithVaultingInstrument = isVaultedInstrument(payment.paymentData || {});

        const nonce = isSubmittingWithVaultingInstrument
            ? await this.tokenizePaymentForVaultedInstrument(payment)
            : await this.tokenizePayment(payment);

        const submitPaymentPayload = isSubmittingWithVaultingInstrument
            ? await this.preparePaymentDataForVaultedInstrument(nonce, payment)
            : await this.preparePaymentData(nonce, payment);

        await this.paymentIntegrationService.submitOrder(order, options);
        await this.paymentIntegrationService.submitPayment(submitPaymentPayload);
    }

    finalize(): Promise<void> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    async deinitialize(): Promise<void> {
        await this.braintreeSdk.deinitialize();

        return Promise.resolve();
    }

    private async tokenizePayment({ paymentData }: OrderPaymentRequestBody): Promise<string> {
        const usBankAccount = this.getUsBankAccountOrThrow();

        if (!isUsBankAccountInstrumentLike(paymentData)) {
            throw new PaymentArgumentInvalidError(['payment.paymentData']);
        }

        const mandateText = isVaultedInstrument(paymentData)
            ? 'The data are used for stored instrument verification'
            : typeof this.getMandateText === 'function' && this.getMandateText();

        if (!mandateText) {
            throw new InvalidArgumentError(
                'Unable to proceed because getMandateText is not provided or returned undefined value.',
            );
        }

        try {
            const { nonce } = await usBankAccount.tokenize({
                bankDetails: this.getBankDetails(paymentData),
                mandateText,
            });

            return nonce;
        } catch (error) {
            this.handleBraintreeError(error);
        }
    }

    private async tokenizePaymentForVaultedInstrument(
        payment: OrderPaymentRequestBody,
    ): Promise<string | null> {
        const { methodId, paymentData = {} } = payment;

        const state = this.paymentIntegrationService.getState();
        const { config } = state.getPaymentMethodOrThrow(methodId);

        if (!config.isVaultingEnabled) {
            throw new InvalidArgumentError(
                'Vaulting is disabled but a vaulted instrument was being used for this transaction',
            );
        }

        const shouldVerifyVaultingInstrument = isUsBankAccountInstrumentLike(paymentData);

        return shouldVerifyVaultingInstrument ? this.tokenizePayment(payment) : null;
    }

    private async preparePaymentData(
        nonce: string | null,
        payment: OrderPaymentRequestBody,
    ): Promise<Payment> {
        const { methodId, paymentData = {} } = payment;

        if (!isUsBankAccountInstrumentLike(paymentData)) {
            throw new PaymentArgumentInvalidError(['payment.paymentData']);
        }

        const { deviceData } = await this.braintreeSdk.getDataCollectorOrThrow();
        const { shouldSaveInstrument, shouldSetAsDefaultInstrument, routingNumber, accountNumber } =
            paymentData;

        return {
            methodId,
            paymentData: {
                deviceSessionId: deviceData,
                shouldSetAsDefaultInstrument,
                shouldSaveInstrument,
                formattedPayload: {
                    tokenized_bank_account: {
                        issuer: routingNumber,
                        masked_account_number: accountNumber.substr(-4),
                        token: nonce,
                    },
                },
            },
        };
    }

    private async preparePaymentDataForVaultedInstrument(
        nonce: string | null,
        payment: OrderPaymentRequestBody,
    ): Promise<Payment> {
        const { methodId, paymentData = {} } = payment;

        if (!isVaultedInstrument(paymentData) || !isHostedInstrumentLike(paymentData)) {
            throw new PaymentArgumentInvalidError(['payment.paymentData']);
        }

        const { deviceData } = await this.braintreeSdk.getDataCollectorOrThrow();
        const { instrumentId, shouldSetAsDefaultInstrument } = paymentData;

        return {
            methodId,
            paymentData: {
                deviceSessionId: deviceData,
                instrumentId,
                shouldSetAsDefaultInstrument,
                ...(nonce && { nonce }),
            },
        };
    }

    private getBankDetails(paymentData: WithBankAccountInstrument): BraintreeUsBankAccountDetails {
        const state = this.paymentIntegrationService.getState();
        const billingAddress = state.getBillingAddressOrThrow();

        const ownershipType = paymentData.ownershipType.toLowerCase();
        const accountType = paymentData.accountType.toLowerCase();

        return {
            accountNumber: paymentData.accountNumber,
            routingNumber: paymentData.routingNumber,
            ownershipType,
            ...(ownershipType === 'personal'
                ? {
                      firstName: paymentData.firstName,
                      lastName: paymentData.lastName,
                  }
                : {
                      businessName: paymentData.businessName,
                  }),
            accountType,
            billingAddress: {
                streetAddress: billingAddress.address1,
                extendedAddress: billingAddress.address2,
                locality: billingAddress.city,
                region: billingAddress.stateOrProvinceCode,
                postalCode: billingAddress.postalCode,
            },
        };
    }

    private getUsBankAccountOrThrow(): BraintreeUsBankAccount {
        if (!this.usBankAccount) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this.usBankAccount;
    }

    private handleBraintreeError(error: unknown): never {
        if (!isBraintreeError(error)) {
            throw error;
        }

        throw new PaymentMethodFailedError(error.message);
    }
}
