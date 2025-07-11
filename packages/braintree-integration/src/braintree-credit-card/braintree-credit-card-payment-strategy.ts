import { some } from 'lodash';

import {
    BraintreeIntegrationService,
    isBraintreeAcceleratedCheckoutCustomer,
    BraintreePaymentProcessor,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import {
    Address,
    isHostedInstrumentLike,
    isVaultedInstrument,
    MissingDataError,
    MissingDataErrorType,
    OrderFinalizationNotRequiredError,
    OrderPaymentRequestBody,
    OrderRequestBody,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentInstrument,
    PaymentInstrumentMeta,
    PaymentIntegrationService,
    PaymentMethod,
    PaymentMethodFailedError,
    PaymentStrategy, RequestError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { WithBraintreeCreditCardPaymentStrategyInitializeOptions } from './braintree-credit-card-payment-strategy-initialize-options';


export default class BraintreeCreditCardPaymentStrategy implements PaymentStrategy {
    private is3dsEnabled?: boolean;
    private isHostedFormInitialized?: boolean;
    private deviceSessionId?: string;
    private paymentMethod?: PaymentMethod;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private braintreePaymentProcessor: BraintreePaymentProcessor,
        private braintreeIntegrationService: BraintreeIntegrationService,
    ) {}

    async initialize(
        options: PaymentInitializeOptions & WithBraintreeCreditCardPaymentStrategyInitializeOptions,
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
            // this.braintreePaymentProcessor.initialize(clientToken, braintree);
            this.braintreeIntegrationService.initialize(clientToken);

            if (this.isHostedPaymentFormEnabled(methodId, gatewayId) && braintree?.form) {
                await this.braintreePaymentProcessor.initializeHostedForm(
                    braintree.form,
                    braintree.unsupportedCardBrands,
                );
                this.isHostedFormInitialized =
                    this.braintreePaymentProcessor.isInitializedHostedForm();
            }

            this.is3dsEnabled = this.paymentMethod.config.is3dsEnabled;
            // this.deviceSessionId = await this.braintreePaymentProcessor.getSessionId();
            this.deviceSessionId = await this.braintreeIntegrationService.getSessionId();

            // TODO: remove this part when BT AXO A/B testing will be finished
            if (this.shouldInitializeBraintreeFastlane()) {
                await this.initializeBraintreeFastlaneOrThrow(methodId);
            }
        } catch (error) {
            return this.handleError(error);
        }
    }

    async execute(orderRequest: OrderRequestBody): Promise<void> {
        const { payment } = orderRequest;
        const state = this.paymentIntegrationService.getState();

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        if (this.isHostedFormInitialized) {
            this.braintreePaymentProcessor.validateHostedForm();
        }

        await this.paymentIntegrationService.submitOrder();

        const billingAddress = state.getBillingAddressOrThrow();
        const orderAmount = state.getOrderOrThrow().orderAmount;
        const paymentPayload = this.isHostedFormInitialized
            ? await this.prepareHostedPaymentData(payment, billingAddress, orderAmount)
            : await this.preparePaymentData(payment, billingAddress, orderAmount);

        try {
            await this.paymentIntegrationService.submitPayment({
                ...payment,
                paymentData: paymentPayload,
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

        await this.braintreeIntegrationService.teardown();
        await this.braintreePaymentProcessor.deinitializeHostedForm();

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
    ): Promise<PaymentInstrument & PaymentInstrumentMeta> {
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
            ? await this.braintreePaymentProcessor.verifyCard(payment, billingAddress, orderAmount)
            : await this.braintreePaymentProcessor.tokenizeCard(payment, billingAddress);

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
    ): Promise<PaymentInstrument & PaymentInstrumentMeta> {
        const { paymentData } = payment;
        const commonPaymentData = { deviceSessionId: this.deviceSessionId };

        if (this.isSubmittingWithStoredCard(payment)) {
            const { nonce } =
                await this.braintreePaymentProcessor.tokenizeHostedFormForStoredCardVerification();

            return {
                ...commonPaymentData,
                ...paymentData,
                nonce,
            };
        }

        const { shouldSaveInstrument = false, shouldSetAsDefaultInstrument = false } =
            isHostedInstrumentLike(paymentData) ? paymentData : {};

        const { nonce } = this.shouldPerform3DSVerification(payment)
            ? await this.braintreePaymentProcessor.verifyCardWithHostedForm(
                billingAddress,
                orderAmount,
            )
            : await this.braintreePaymentProcessor.tokenizeHostedForm(billingAddress);

        return {
            ...commonPaymentData,
            shouldSaveInstrument,
            shouldSetAsDefaultInstrument,
            nonce,
        };
    }

    private async processAdditionalAction(
        error: unknown,
        payment: OrderPaymentRequestBody,
        orderAmount: number,
    ): Promise<void> {
        const state = this.paymentIntegrationService.getState();

        if (
            !(error instanceof RequestError) ||
            !some(error.body.errors, { code: 'three_d_secure_required' })
        ) {
            return this.handleError(error);
        }

        try {
            const { payer_auth_request: storedCreditCardNonce } = error.body.three_ds_result || {};
            const { paymentData } = payment;

            if (!paymentData || !isVaultedInstrument(paymentData)) {
                throw new PaymentArgumentInvalidError(['instrumentId']);
            }

            const instrument = state.getCardInstrumentOrThrow(paymentData.instrumentId);
            const { nonce } = await this.braintreePaymentProcessor.challenge3DSVerification(
                {
                    nonce: storedCreditCardNonce,
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
        const state = this.paymentIntegrationService.getState();

        if (!methodId) {
            return false;
        }

        const paymentMethod = state.getPaymentMethodOrThrow(methodId, gatewayId);

        return paymentMethod.config.isHostedFormEnabled === true;
    }

    private isSubmittingWithStoredCard(payment: OrderPaymentRequestBody): boolean {
        return !!(payment.paymentData && isVaultedInstrument(payment.paymentData));
    }

    private shouldPerform3DSVerification(payment: OrderPaymentRequestBody): boolean {
        return !!(this.is3dsEnabled && !this.isSubmittingWithStoredCard(payment));
    }

    // TODO: remove this part when BT AXO A/B testing will be finished
    private shouldInitializeBraintreeFastlane() {
        const state = this.paymentIntegrationService.getState();
        const paymentProviderCustomer = state.getPaymentProviderCustomerOrThrow();
        const braintreePaymentProviderCustomer = isBraintreeAcceleratedCheckoutCustomer(
            paymentProviderCustomer,
        )
            ? paymentProviderCustomer
            : {};
        const isAcceleratedCheckoutEnabled =
            this.paymentMethod?.initializationData.isAcceleratedCheckoutEnabled;

        return (
            isAcceleratedCheckoutEnabled && !braintreePaymentProviderCustomer?.authenticationState
        );
    }

    // TODO: remove this part when BT AXO A/B testing will be finished
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
