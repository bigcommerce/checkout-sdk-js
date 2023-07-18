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

import {
    BankAccountSuccessPayload,
    BraintreeBankAccount,
    BraintreeInitializationData,
} from '../braintree';
import BraintreeIntegrationService from '../braintree-integration-service';
import isBraintreeError from '../is-braintree-error';
import isUsBankAccountInstrumentLike from '../is-us-bank-account-instrument-like';

import { WithBraintreePaypalAchPaymentInitializeOptions } from './braintree-paypal-ach-initialize-options';

export default class BraintreePaypalAchPaymentStrategy implements PaymentStrategy {
    private usBankAccount?: BraintreeBankAccount;
    private getMandateText?: () => string;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private braintreeIntegrationService: BraintreeIntegrationService,
    ) {}

    async initialize(
        options: PaymentInitializeOptions & WithBraintreePaypalAchPaymentInitializeOptions,
    ): Promise<void> {
        const { getMandateText } = options.braintreeach || {};

        if (!options.methodId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.methodId" argument is not provided.',
            );
        }

        this.getMandateText = getMandateText;

        await this.paymentIntegrationService.loadPaymentMethod(options.methodId);

        const state = this.paymentIntegrationService.getState();

        const paymentMethod = state.getPaymentMethodOrThrow<BraintreeInitializationData>(
            options.methodId,
        );
        const { clientToken, initializationData } = paymentMethod;

        if (!clientToken || !initializationData) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        try {
            this.braintreeIntegrationService.initialize(clientToken, initializationData);
            this.usBankAccount = await this.braintreeIntegrationService.getUsBankAccount();
        } catch (error) {
            this.handleError(error);
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
        this.getMandateText = undefined;

        return Promise.resolve();
    }

    private async preparePaymentData(
        nonce: string | null,
        payment: OrderPaymentRequestBody,
    ): Promise<Payment> {
        const { paymentData = {} } = payment;

        if (!isUsBankAccountInstrumentLike(paymentData)) {
            throw new PaymentArgumentInvalidError(['payment.paymentData']);
        }

        const sessionId = await this.braintreeIntegrationService.getSessionId();

        const { shouldSaveInstrument, shouldSetAsDefaultInstrument, routingNumber, accountNumber } =
            paymentData;

        const paymentPayload = {
            formattedPayload: {
                vault_payment_instrument: shouldSaveInstrument || null,
                set_as_default_stored_instrument: shouldSetAsDefaultInstrument || null,
                device_info: sessionId || null,
                tokenized_bank_account: {
                    issuer: routingNumber,
                    masked_account_number: accountNumber.substr(-4),
                    token: nonce,
                },
            },
        };

        return {
            methodId: payment.methodId,
            paymentData: paymentPayload,
        };
    }

    private async preparePaymentDataForVaultedInstrument(
        nonce: string | null,
        payment: OrderPaymentRequestBody,
    ): Promise<Payment> {
        const { paymentData = {} } = payment;

        if (!isVaultedInstrument(paymentData) || !isHostedInstrumentLike(paymentData)) {
            throw new PaymentArgumentInvalidError(['payment.paymentData']);
        }

        const sessionId = await this.braintreeIntegrationService.getSessionId();

        return {
            methodId: payment.methodId,
            paymentData: {
                deviceSessionId: sessionId,
                instrumentId: paymentData.instrumentId,
                shouldSetAsDefaultInstrument: paymentData.shouldSetAsDefaultInstrument,
                ...(nonce && { nonce }),
            },
        };
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
            this.handleError(error);
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

    private getBankDetails(paymentData: WithBankAccountInstrument): BankAccountSuccessPayload {
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

    private getUsBankAccountOrThrow(): BraintreeBankAccount {
        if (!this.usBankAccount) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this.usBankAccount;
    }

    private handleError(error: unknown): never {
        if (!isBraintreeError(error)) {
            throw error;
        }

        throw new PaymentMethodFailedError(error.message);
    }
}
