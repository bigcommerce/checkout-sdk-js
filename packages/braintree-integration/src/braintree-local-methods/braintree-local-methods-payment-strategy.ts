// TODO: test this strategy on integration store or fix your cluster an check it there

import {
    BraintreeInitializationData,
    BraintreeLocalPayment,
    BraintreeLocalPaymentConfig,
    BraintreeSdk,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import {
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentMethodInvalidError,
    PaymentRequestOptions,
    PaymentStrategy,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { LoadingIndicator } from '@bigcommerce/checkout-sdk/ui';

import {
    BraintreeLocalMethodsPaymentInitializeOptions,
    WithBraintreeLocalMethodsPaymentInitializeOptions,
} from './braintree-local-methods-options';

export default class BraintreeLocalMethodsPaymentStrategy implements PaymentStrategy {
    private braintreeLocalPayment?: BraintreeLocalPayment;
    private loadingIndicatorContainer?: string;
    private onError?: BraintreeLocalMethodsPaymentInitializeOptions['onError'];
    private orderId?: string;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private braintreeSdk: BraintreeSdk,
        private loadingIndicator: LoadingIndicator,
    ) {}

    async initialize(
        options: PaymentInitializeOptions & WithBraintreeLocalMethodsPaymentInitializeOptions,
    ): Promise<void> {
        const { gatewayId, braintreelocalmethods } = options;

        if (!gatewayId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.gatewayId" argument is not provided.',
            );
        }

        if (!braintreelocalmethods) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.braintreelocalmethods" argument is not provided.`,
            );
        }

        await this.paymentIntegrationService.loadPaymentMethod(gatewayId);

        const state = this.paymentIntegrationService.getState();
        const storeConfig = state.getStoreConfigOrThrow();
        const paymentMethod = state.getPaymentMethodOrThrow<BraintreeInitializationData>(gatewayId);
        const { clientToken, config, initializationData } = paymentMethod;

        if (!clientToken || !initializationData) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        this.loadingIndicatorContainer = braintreelocalmethods.container.split('#')[1];

        try {
            this.braintreeSdk.initialize(clientToken, storeConfig);

            this.braintreeLocalPayment = await this.braintreeSdk.getBraintreeLocalPayment(config.merchantId);
        } catch (error: unknown) {
            this.handleError(error);
        }
    }

    finalize(): Promise<void> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    async deinitialize(): Promise<void> {
        this.orderId = undefined;
        this.toggleLoadingIndicator(false);

        return Promise.resolve();
    }

    async execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void> {
        const { payment, ...order } = payload;

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        const methodId = payment.methodId;

        const state = this.paymentIntegrationService.getState();
        const cart = state.getCartOrThrow();
        const checkout = state.getCheckoutOrThrow();
        const billing = state.getBillingAddressOrThrow();
        const isShippingRequired = cart.lineItems.physicalItems.length > 0;

        this.toggleLoadingIndicator(true);

        const { deviceData } = await this.braintreeSdk.getDataCollectorOrThrow();
        const braintreeLocalPayment = this.getBraintreeLocalPaymentOrThrow();

        const paymentConfig: BraintreeLocalPaymentConfig = {
            paymentType: payment.methodId,
            amount: checkout.outstandingBalance,
            currencyCode: cart.currency.code,
            email: cart.email,
            fallback: { // TODO: Do we need this fallback function?
                url: 'url-placeholder',
                buttonText: 'button placeholder',
            },
            shippingAddressRequired: isShippingRequired,
            givenName: billing.firstName,
            surname: billing.lastName,
            address: {
                countryCode: billing.countryCode,
            },
            onPaymentStart: (data, start): void => {
                this.orderId = data.paymentId;
                start(); // Call start to initiate the popup
            },
        };

        const nonce = await new Promise((resolve, reject) => {
            braintreeLocalPayment.startPayment(paymentConfig,
                (error, payload) => {
                    if (error) {
                        const errorToThrow = error.code === 'LOCAL_PAYMENT_WINDOW_CLOSED'
                            ? undefined
                            : error;

                        reject(() => this.handleError(errorToThrow));
                    }

                    resolve(payload.nonce);
                }
            )
        });

        if (!this.orderId) {
            throw PaymentMethodInvalidError;
        }

        try {
            await this.paymentIntegrationService.submitOrder(order, options);
            await this.paymentIntegrationService.submitPayment({
                methodId,
                paymentData: {
                    deviceSessionId: deviceData,
                    formattedPayload: {
                        [`${methodId}_account`]: {
                            email: cart.email,
                            token: nonce,
                            order_id: this.orderId,
                        },
                    },
                },
            });
        } catch (error: unknown) {
            this.handleError(error);
        }
    }

    private getBraintreeLocalPaymentOrThrow() {
        if (!this.braintreeLocalPayment) {
            throw new PaymentMethodInvalidError();
        }

        return this.braintreeLocalPayment;
    }

    private toggleLoadingIndicator(isLoading: boolean): void {
        if (isLoading && this.loadingIndicatorContainer) {
            this.loadingIndicator.show(this.loadingIndicatorContainer);
        } else {
            this.loadingIndicator.hide();
        }
    }

    private handleError(error?: unknown) {
        this.toggleLoadingIndicator(false);

        if (error && this.onError && typeof this.onError === 'function') {
            this.onError(error);
        }
    }
}
