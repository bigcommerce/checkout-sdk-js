import { some } from 'lodash';

import {
    BraintreeIntegrationService,
    isBraintreeAcceleratedCheckoutCustomer,
    isBraintreePaymentRequest3DSError,
} from '@bigcommerce/checkout-sdk/braintree-utils';

import {
    Address,
    BraintreePaymentInstrument,
    isHostedInstrumentLike,
    isVaultedInstrument,
    MissingDataError,
    MissingDataErrorType,
    NonceInstrument,
    OrderFinalizationNotRequiredError,
    OrderPaymentRequestBody,
    OrderRequestBody,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentInstrumentMeta,
    PaymentIntegrationService,
    PaymentMethod,
    PaymentMethodFailedError,
    PaymentStrategy,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import BraintreeHostedForm from '../braintree-hosted-form/braintree-hosted-form';
import { WithBraintreeCreditCardPaymentInitializeOptions } from './braintree-credit-card-payment-initialize-options';

export default class BraintreeCreditCardPaymentStrategy implements PaymentStrategy {
    private is3dsEnabled?: boolean;
    private isHostedFormInitialized?: boolean;
    private deviceSessionId?: string;
    private paymentMethod?: PaymentMethod;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private braintreeIntegrationService: BraintreeIntegrationService,
        private braintreeHostedForm: BraintreeHostedForm,
    ) {}

    async initialize(
        options: PaymentInitializeOptions & WithBraintreeCreditCardPaymentInitializeOptions,
    ): Promise<void> {
        const { methodId, gatewayId, braintree } = options;
        await this.paymentIntegrationService.loadPaymentMethod(methodId);
        const state = this.paymentIntegrationService.getState();

        this.paymentMethod = state.getPaymentMethodOrThrow(methodId);
        const { clientToken } = this.paymentMethod;

        if (!clientToken) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        try {
            this.braintreeIntegrationService.initialize(clientToken, braintree?.threeDSecure);

            if (this.isHostedPaymentFormEnabled(methodId, gatewayId) && braintree?.form) {
                await this.braintreeHostedForm.initialize(
                    braintree.form,
                    braintree.unsupportedCardBrands,
                    clientToken,
                );

                this.isHostedFormInitialized = this.braintreeHostedForm.isInitialized();
            }

            this.is3dsEnabled = this.paymentMethod.config.is3dsEnabled;
            this.deviceSessionId = await this.braintreeIntegrationService.getSessionId();

            // TODO: Remove when BT AXO A/B testing is finished
            if (this.shouldInitializeBraintreeFastlane()) {
                await this.initializeBraintreeFastlaneOrThrow(methodId);
            }
        } catch (error) {
            return this.handleError(error);
        }
    }

    async execute(orderRequest: OrderRequestBody): Promise<void> {
        const { payment, ...order } = orderRequest;

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        if (this.isHostedFormInitialized) {
            this.braintreeHostedForm.validate();
        }

        await this.paymentIntegrationService.submitOrder(order);
        const state = this.paymentIntegrationService.getState();
        const billingAddress = state.getBillingAddressOrThrow();
        const orderAmount = state.getOrderOrThrow().orderAmount;

        try {
            const paymentData = this.isHostedFormInitialized
                ? await this.prepareHostedPaymentData(payment, billingAddress, orderAmount)
                : await this.preparePaymentData(payment, billingAddress, orderAmount);

            await this.paymentIntegrationService.submitPayment({
                ...payment,
                paymentData,
            });
        } catch (error) {
            return this.processAdditionalAction(error, payment, orderAmount);
        }
    }

    finalize(): Promise<void> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    async deinitialize(): Promise<void> {
        this.isHostedFormInitialized = false;

        await Promise.all([
            this.braintreeIntegrationService.teardown(),
            this.braintreeHostedForm.deinitialize(),
        ]);

        return Promise.resolve();
    }

    private handleError(error: unknown): never {
        if (error instanceof Error && error.name === 'BraintreeError') {
            throw new PaymentMethodFailedError(error.message);
        }

        throw error;
    }

    private async preparePaymentData(
        payment: OrderPaymentRequestBody,
        billingAddress: Address,
        orderAmount: number,
    ): Promise<BraintreePaymentInstrument & PaymentInstrumentMeta> {
        const { paymentData } = payment;
        const commonPaymentData = { deviceSessionId: this.deviceSessionId };

        if (this.isSubmittingWithStoredCard(payment)) {
            return {
                ...commonPaymentData,
                ...paymentData,
            };
        }

        const { shouldSaveInstrument = false, shouldSetAsDefaultInstrument = false } =
            isHostedInstrumentLike(paymentData) ? paymentData : {};

        const { nonce } = this.shouldPerform3DSVerification(payment)
            ? await this.braintreeIntegrationService.verifyCard(
                  payment,
                  billingAddress,
                  orderAmount,
              )
            : await this.braintreeIntegrationService.tokenizeCard(payment, billingAddress);

        return {
            ...commonPaymentData,
            nonce,
            shouldSaveInstrument,
            shouldSetAsDefaultInstrument,
        };
    }

    private async prepareHostedPaymentData(
        payment: OrderPaymentRequestBody,
        billingAddress: Address,
        orderAmount: number,
    ): Promise<BraintreePaymentInstrument & PaymentInstrumentMeta> {
        const { paymentData } = payment;
        const commonPaymentData = { deviceSessionId: this.deviceSessionId };

        if (this.isSubmittingWithStoredCard(payment)) {
            const { nonce } = await this.braintreeHostedForm.tokenizeForStoredCardVerification();

            return {
                ...commonPaymentData,
                ...paymentData,
                nonce,
            };
        }

        const { shouldSaveInstrument = false, shouldSetAsDefaultInstrument = false } =
            isHostedInstrumentLike(paymentData) ? paymentData : {};

        const { nonce } = this.shouldPerform3DSVerification(payment)
            ? await this.verifyCardWithHostedForm(billingAddress, orderAmount)
            : await this.braintreeHostedForm.tokenize(billingAddress);

        return {
            ...commonPaymentData,
            shouldSaveInstrument,
            shouldSetAsDefaultInstrument,
            nonce,
        };
    }

    private async verifyCardWithHostedForm(
        billingAddress: Address,
        orderAmount: number,
    ): Promise<NonceInstrument> {
        const tokenizationPayload = await this.braintreeHostedForm.tokenize(billingAddress);

        return this.braintreeIntegrationService.challenge3DSVerification(
            tokenizationPayload,
            orderAmount,
        );
    }

    private async processAdditionalAction(
        error: unknown,
        payment: OrderPaymentRequestBody,
        orderAmount: number,
    ): Promise<void> {
        if (
            isBraintreePaymentRequest3DSError(error) &&
            (error.name !== 'RequestError' ||
                !some(error.body.errors, { code: 'three_d_secure_required' }))
        ) {
            return this.handleError(error);
        }

        try {
            const { payer_auth_request: storedCreditCardNonce } =
                (isBraintreePaymentRequest3DSError(error) && error.body.three_ds_result) || {};
            const { paymentData } = payment;
            const state = this.paymentIntegrationService.getState();

            if (!paymentData || !isVaultedInstrument(paymentData)) {
                throw new PaymentArgumentInvalidError(['instrumentId']);
            }

            const instrument = state.getCardInstrumentOrThrow(paymentData.instrumentId);
            const { nonce } = await this.braintreeIntegrationService.challenge3DSVerification(
                {
                    nonce: storedCreditCardNonce || '',
                    bin: instrument.iin,
                },
                orderAmount,
            );

            await this.paymentIntegrationService.submitPayment({
                ...payment,
                paymentData: {
                    deviceSessionId: this.deviceSessionId,
                    nonce,
                },
            });
        } catch (error) {
            return this.handleError(error);
        }
    }

    private isHostedPaymentFormEnabled(methodId?: string, gatewayId?: string): boolean {
        if (!methodId) {
            return false;
        }

        const state = this.paymentIntegrationService.getState();
        const paymentMethod = state.getPaymentMethodOrThrow(methodId, gatewayId);

        return paymentMethod.config.isHostedFormEnabled === true;
    }

    private isSubmittingWithStoredCard(payment: OrderPaymentRequestBody): boolean {
        return !!(payment.paymentData && isVaultedInstrument(payment.paymentData));
    }

    private shouldPerform3DSVerification(payment: OrderPaymentRequestBody): boolean {
        return !!(this.is3dsEnabled && !this.isSubmittingWithStoredCard(payment));
    }

    // TODO: Remove when BT AXO A/B testing is finished
    private shouldInitializeBraintreeFastlane(): boolean {
        const state = this.paymentIntegrationService.getState();
        const paymentProviderCustomer = state.getPaymentProviderCustomerOrThrow();
        const braintreeCustomer = isBraintreeAcceleratedCheckoutCustomer(paymentProviderCustomer)
            ? paymentProviderCustomer
            : {};
        const isFastlaneEnabled: boolean =
            this.paymentMethod?.initializationData.isAcceleratedCheckoutEnabled;

        return isFastlaneEnabled && !braintreeCustomer?.authenticationState;
    }

    // TODO: Remove when BT AXO A/B testing is finished
    private async initializeBraintreeFastlaneOrThrow(methodId: string): Promise<void> {
        const state = this.paymentIntegrationService.getState();
        const cart = state.getCartOrThrow();
        const paymentMethod = state.getPaymentMethodOrThrow(methodId);
        const { clientToken, config } = paymentMethod;

        if (!clientToken) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        this.braintreeIntegrationService.initialize(clientToken);

        await this.braintreeIntegrationService.getBraintreeFastlane(cart.id, config.testMode);
    }
}
