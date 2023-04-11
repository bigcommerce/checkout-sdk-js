import {
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    NotInitializedError,
    NotInitializedErrorType,
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentMethodFailedError,
    PaymentRequestOptions,
    PaymentStrategy,
    UsBankAccountInstrument,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { BraintreeUsBankAccount, UsBankAccountSuccessPayload } from '../braintree';
import BraintreeIntegrationService from '../braintree-integration-service';
import isBraintreeError from '../is-braintree-error';
import isUsBankAccountInstrumentLike from '../is-us-bank-account-instrument-like';

import { WithBraintreePaypalAchInitializeOptions } from './braintree-paypal-ach-initialize-options';

export default class BraintreePaypalAchPaymentStrategy implements PaymentStrategy {
    private usBankAccount?: BraintreeUsBankAccount;
    private mandateText = '';

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private braintreeIntegrationService: BraintreeIntegrationService,
    ) {}

    async initialize(
        options: PaymentInitializeOptions & WithBraintreePaypalAchInitializeOptions,
    ): Promise<void> {
        const { mandateText } = options.braintreeach || {};

        if (!options.methodId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.methodId" argument is not provided.',
            );
        }

        if (!mandateText) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.braintreeach.mandateText" argument is not provided.',
            );
        }

        this.mandateText = mandateText;

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

        const { paymentData } = payment;

        if (!isUsBankAccountInstrumentLike(paymentData)) {
            throw new PaymentArgumentInvalidError(['payment.paymentData']);
        }

        if (!this.usBankAccount) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        try {
            const { nonce } = await this.usBankAccount.tokenize({
                bankDetails: this.getBankDetails(paymentData),
                mandateText: this.mandateText,
            });

            const sessionId = await this.braintreeIntegrationService.getSessionId();

            const state = this.paymentIntegrationService.getState();
            const { email } = state.getCustomerOrThrow();

            const paymentPayload = {
                formattedPayload: {
                    vault_payment_instrument: true,
                    set_as_default_stored_instrument: null,
                    device_info: sessionId || null,
                    us_bank_account: {
                        token: nonce,
                        email: email || null,
                    },
                },
            };

            await this.paymentIntegrationService.submitOrder(order, options);
            await this.paymentIntegrationService.submitPayment({
                methodId: payment.methodId,
                paymentData: paymentPayload,
            });
        } catch (error) {
            this.handleError(error);
        }
    }

    finalize(): Promise<void> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    async deinitialize(): Promise<void> {
        this.mandateText = '';
        await this.usBankAccount?.teardown();
    }

    private getBankDetails(paymentData: UsBankAccountInstrument): UsBankAccountSuccessPayload {
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
                streetAddress: paymentData.address1,
                extendedAddress: paymentData.address2,
                locality: paymentData.city,
                region: paymentData.stateOrProvinceCode,
                postalCode: paymentData.postalCode,
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
