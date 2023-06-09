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

import { BankAccountSuccessPayload, BraintreeBankAccount } from '../braintree';
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

        const paymentMethod = state.getPaymentMethodOrThrow(options.methodId);

        if (!paymentMethod.clientToken) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        try {
            this.braintreeIntegrationService.initialize(paymentMethod.clientToken);
            this.usBankAccount = await this.braintreeIntegrationService.getUsBankAccount();
        } catch (error) {
            this.handleError(error);
        }
    }

    async execute(orderRequest: OrderRequestBody, options: PaymentRequestOptions): Promise<void> {
        const { payment, ...order } = orderRequest;

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        try {
            const nonce = await this.tokenizePayment(payment);
            const submitPaymentPayload = await this.preparePaymentData(nonce, payment);

            await this.paymentIntegrationService.submitOrder(order, options);
            await this.paymentIntegrationService.submitPayment(submitPaymentPayload);
        } catch (error) {
            this.handleError(error);
        }
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

        if (!nonce) {
            if (!isVaultedInstrument(paymentData) || !isHostedInstrumentLike(paymentData)) {
                throw new PaymentArgumentInvalidError(['payment.paymentData']);
            }

            return {
                methodId: payment.methodId,
                paymentData: {
                    instrumentId: paymentData.instrumentId,
                    shouldSetAsDefaultInstrument: paymentData.shouldSetAsDefaultInstrument,
                },
            };
        }

        if (!isUsBankAccountInstrumentLike(paymentData)) {
            throw new PaymentArgumentInvalidError(['payment.paymentData']);
        }

        const sessionId = await this.braintreeIntegrationService.getSessionId();

        const state = this.paymentIntegrationService.getState();

        const { email } = state.getBillingAddressOrThrow();

        const { shouldSaveInstrument, shouldSetAsDefaultInstrument, routingNumber, accountNumber } =
            paymentData;

        const paymentPayload = {
            formattedPayload: {
                vault_payment_instrument: shouldSaveInstrument || null,
                set_as_default_stored_instrument: shouldSetAsDefaultInstrument || null,
                device_info: sessionId || null,
                ach_account: {
                    routing_number: routingNumber,
                    last4: accountNumber.substr(-4),
                    token: nonce,
                    email: email || null,
                },
            },
        };

        return {
            methodId: payment.methodId,
            paymentData: paymentPayload,
        };
    }

    private async tokenizePayment(payment: OrderPaymentRequestBody) {
        const { methodId, paymentData = {} } = payment;

        if (isVaultedInstrument(paymentData)) {
            const state = this.paymentIntegrationService.getState();
            const { config } = state.getPaymentMethodOrThrow(methodId);

            if (!config.isVaultingEnabled) {
                throw new InvalidArgumentError(
                    'Vaulting is disabled but a vaulted instrument was being used for this transaction',
                );
            }

            return null;
        }

        if (!isUsBankAccountInstrumentLike(paymentData)) {
            throw new PaymentArgumentInvalidError(['payment.paymentData']);
        }

        if (!this.usBankAccount) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        const mandateText = typeof this.getMandateText === 'function' && this.getMandateText();

        if (!mandateText) {
            throw new InvalidArgumentError(
                'Unable to proceed because getMandateText is not provided or returned undefined value.',
            );
        }

        try {
            const { nonce } = await this.usBankAccount.tokenize({
                bankDetails: this.getBankDetails(paymentData),
                mandateText,
            });

            return nonce;
        } catch (error) {
            this.handleError(error);
        }
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

    private handleError(error: unknown): never {
        if (!isBraintreeError(error)) {
            throw error;
        }

        throw new PaymentMethodFailedError(error.message);
    }
}
