import { noop } from 'lodash';

import {
    MissingDataError,
    MissingDataErrorType,
    NotInitializedError,
    NotInitializedErrorType,
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentInitializeOptions,
    PaymentIntegrationSelectors,
    PaymentIntegrationService,
    PaymentMethod,
    PaymentRequestOptions,
    PaymentStrategy,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import PaypalExpressPaymentInitializeOptions from './paypal-express-payment-initialize-options';
import PaypalScriptLoader from './paypal-express-script-loader';
import { PaymentStatusTypes, PaypalHostWindow, PaypalSDK } from './paypal-express-types';

export default class PaypalExpressPaymentStrategy implements PaymentStrategy {
    private paypalSdk?: PaypalSDK;
    private paymentMethod?: PaymentMethod;
    private useRedirectFlow = false;
    private window: PaypalHostWindow;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private scriptLoader: PaypalScriptLoader,
    ) {
        this.window = window;
    }

    async initialize(options: PaymentInitializeOptions & PaypalExpressPaymentInitializeOptions) {
        const state = this.paymentIntegrationService.getState();

        this.paymentMethod = state.getPaymentMethodOrThrow(options.methodId);
        this.useRedirectFlow =
            (options.paypalexpress && options.paypalexpress.useRedirectFlow) === true;

        const merchantId = this.paymentMethod.config.merchantId;

        if (!this.isInContextEnabled() || !merchantId) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const paypalSdk = await this.scriptLoader.loadPaypalSDK();

        this.paypalSdk = paypalSdk;

        this.paypalSdk.checkout.setup(merchantId, {
            button: 'paypal-button',
            environment: this.paymentMethod.config.testMode ? 'sandbox' : 'production',
        });
    }

    deinitialize() {
        if (this.isInContextEnabled() && this.paypalSdk) {
            this.paypalSdk.checkout.closeFlow();
            this.paypalSdk = undefined;
        }

        return Promise.resolve();
    }

    async execute(payload: OrderRequestBody, options?: PaymentRequestOptions) {
        let state: PaymentIntegrationSelectors;
        let redirectUrl: string | undefined;
        const paypal = this.paypalSdk;

        if (this.isAcknowledgedOrFinalized()) {
            await this.paymentIntegrationService.submitOrder(payload, options);

            return;
        }

        if (!this.isInContextEnabled() || this.useRedirectFlow) {
            state = await this.paymentIntegrationService.submitOrder(payload, options);
            redirectUrl = state.getPaymentRedirectUrl();

            if (redirectUrl && this.window.top) {
                this.window.top.location.href = redirectUrl;
            }

            // We need to hold execution so the consumer does not redirect us somewhere else
            return new Promise<never>(noop);
        }

        if (!paypal) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        paypal.checkout.initXO();

        try {
            state = await this.paymentIntegrationService.submitOrder(payload, options);
        } catch (error) {
            paypal.checkout.closeFlow();

            return Promise.reject(error);
        }

        redirectUrl = state.getPaymentRedirectUrl();

        if (redirectUrl) {
            paypal.checkout.startFlow(redirectUrl);
        }

        // We need to hold execution so the consumer does not redirect us somewhere else
        return new Promise<never>(noop);
    }

    async finalize(options?: PaymentRequestOptions) {
        const state = this.paymentIntegrationService.getState();
        const order = state.getOrder();

        if (order && this.isAcknowledgedOrFinalized()) {
            await this.paymentIntegrationService.finalizeOrder(options);

            return Promise.resolve();
        }

        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    private isAcknowledgedOrFinalized(): boolean {
        const state = this.paymentIntegrationService.getState();

        return (
            state.getPaymentStatus() === PaymentStatusTypes.ACKNOWLEDGE ||
            state.getPaymentStatus() === PaymentStatusTypes.FINALIZE
        );
    }

    private isInContextEnabled(): boolean {
        return !!(this.paymentMethod && this.paymentMethod.config.merchantId);
    }
}
