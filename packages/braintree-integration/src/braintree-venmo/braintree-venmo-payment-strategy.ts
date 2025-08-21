import {
    BraintreeError,
    BraintreeIntegrationService,
    BraintreeTokenizePayload,
    BraintreeVenmoCheckout,
    isBraintreeError,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import {
    FormattedPayload,
    MissingDataError,
    MissingDataErrorType,
    OrderFinalizationNotRequiredError,
    OrderPaymentRequestBody,
    OrderRequestBody,
    Payment,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentMethod,
    PaymentMethodCancelledError,
    PaymentMethodFailedError,
    PaymentStrategy,
    PaypalInstrument,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { isExperimentEnabled } from '@bigcommerce/checkout-sdk/utility';
import BraintreeVenmoPaymentStrategyInitializeOptions, {
    WithBraintreeVenmoInitializeOptions,
} from './braintree-venmo-payment-strategy-initialize-options';

export default class BraintreeVenmoPaymentStrategy implements PaymentStrategy {
    private braintreeVenmoCheckout?: BraintreeVenmoCheckout;
    private venmoOptions?: BraintreeVenmoPaymentStrategyInitializeOptions;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private braintreeIntegrationService: BraintreeIntegrationService,
    ) {}

    async initialize(
        options: PaymentInitializeOptions & WithBraintreeVenmoInitializeOptions,
    ): Promise<void> {
        const { methodId } = options;

        await this.paymentIntegrationService.loadPaymentMethod(methodId);
        const state = this.paymentIntegrationService.getState();

        this.venmoOptions = options.braintreevenmo;

        const paymentMethod = state.getPaymentMethodOrThrow(methodId);

        await this.initializeBraintreeVenmo(paymentMethod);
    }

    async execute(orderRequest: OrderRequestBody): Promise<void> {
        const { payment, ...order } = orderRequest;

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        try {
            const paymentData = await this.preparePaymentData(payment);
            await this.paymentIntegrationService.submitOrder(order);
            await this.paymentIntegrationService.submitPayment(paymentData);
        } catch (error) {
            this.handleError(error);
        }
    }

    finalize(): Promise<void> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    async deinitialize(): Promise<void> {
        await this.braintreeIntegrationService.teardown();

        return Promise.resolve();
    }

    private handleError(error: unknown): never {
        if (!isBraintreeError(error)) {
            throw error;
        }

        if (error.code === 'PAYPAL_POPUP_CLOSED') {
            throw new PaymentMethodCancelledError(error.message);
        }

        throw new PaymentMethodFailedError(error.message);
    }

    private async initializeBraintreeVenmo(paymentMethod: PaymentMethod): Promise<void> {
        const { clientToken } = paymentMethod;

        if (!clientToken) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const state = this.paymentIntegrationService.getState();
        const features = state.getStoreConfigOrThrow().checkoutSettings.features;
        const isBraintreeVenmoWebFallbackSupport = isExperimentEnabled(
            features,
            'PAYPAL-5406.braintree_venmo_web_fallback_support',
        );

        try {
            this.braintreeIntegrationService.initialize(clientToken);
            this.braintreeVenmoCheckout = await this.braintreeIntegrationService.getVenmoCheckout({
                ...(this.venmoOptions?.allowDesktop !== undefined
                    ? { allowDesktop: this.venmoOptions.allowDesktop }
                    : {}),
                ...(isBraintreeVenmoWebFallbackSupport
                    ? {
                          mobileWebFallBack: isBraintreeVenmoWebFallbackSupport,
                      }
                    : {}),
            });
        } catch (error) {
            this.handleError(error);
        }
    }

    private async preparePaymentData(payment: OrderPaymentRequestBody): Promise<Payment> {
        const state = this.paymentIntegrationService.getState();
        const { nonce } = state.getPaymentMethodOrThrow(payment.methodId);

        if (nonce) {
            return { ...payment, paymentData: this.formattedPayload(nonce) };
        }
        const tokenizeResult = await this.braintreeVenmoTokenize();
        const sessionId = await this.braintreeIntegrationService.getSessionId();

        return {
            ...payment,
            paymentData: this.formattedPayload(
                tokenizeResult.nonce,
                tokenizeResult.details.email,
                sessionId,
            ),
        };
    }

    private formattedPayload(
        token: string,
        email?: string,
        sessionId?: string,
    ): FormattedPayload<PaypalInstrument> {
        return {
            formattedPayload: {
                vault_payment_instrument: null,
                set_as_default_stored_instrument: null,
                device_info: sessionId || null,
                paypal_account: {
                    token,
                    email: email || null,
                },
            },
        };
    }

    private braintreeVenmoTokenize(): Promise<BraintreeTokenizePayload> {
        return new Promise((resolve, reject) => {
            this.braintreeVenmoCheckout?.tokenize(
                (error: BraintreeError | undefined, payload: BraintreeTokenizePayload) => {
                    if (error) {
                        return reject(error);
                    }

                    resolve(payload);
                },
            );
        });
    }
}
