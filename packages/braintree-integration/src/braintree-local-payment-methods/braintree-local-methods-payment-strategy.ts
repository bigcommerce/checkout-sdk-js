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

import { BraintreeInitializationData } from '../braintree';
import BraintreeIntegrationService from '../braintree-integration-service';

import {
    BraintreeLocalMethods,
    LocalPaymentInstance,
    LocalPaymentsPayload,
    onPaymentStartData,
    StartPaymentError,
    WithBraintreeLocalMethodsPaymentInitializeOptions,
} from './braintree-local-methods-options';

export default class BraintreeLocalMethodsPaymentStrategy implements PaymentStrategy {
    private orderId?: string;
    private localPaymentInstance?: LocalPaymentInstance;
    private braintreeLocalMethods?: BraintreeLocalMethods;
    private loadingIndicatorContainer?: string;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private braintreeIntegrationService: BraintreeIntegrationService,
        private loadingIndicator: LoadingIndicator,
    ) {}

    async initialize(
        options: PaymentInitializeOptions & WithBraintreeLocalMethodsPaymentInitializeOptions,
    ): Promise<void> {
        const { gatewayId, methodId, braintreelocalmethods } = options;

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.methodId" argument is not provided.',
            );
        }

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

        this.braintreeLocalMethods = braintreelocalmethods;

        this.loadingIndicatorContainer = braintreelocalmethods.container.split('#')[1];

        await this.paymentIntegrationService.loadPaymentMethod(gatewayId);

        const state = this.paymentIntegrationService.getState();
        const paymentMethod = state.getPaymentMethodOrThrow<BraintreeInitializationData>(gatewayId);
        const { clientToken, config, initializationData } = paymentMethod;

        if (!clientToken || !initializationData) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        try {
            this.braintreeIntegrationService.initialize(clientToken, initializationData);
            await this.braintreeIntegrationService.loadBraintreeLocalMethods(
                this.getLocalPaymentInstance.bind(this),
                config.merchantId || '',
            );
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
        const state = this.paymentIntegrationService.getState();
        const cart = state.getCartOrThrow();
        const sessionId = await this.braintreeIntegrationService.getSessionId();
        const billing = state.getBillingAddressOrThrow();
        const { firstName, lastName, countryCode } = billing;
        const { cartAmount, currency, email, lineItems } = cart;
        const isShippingRequired = lineItems.physicalItems.length > 0;

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        this.toggleLoadingIndicator(true);

        if (!this.localPaymentInstance) {
            throw new PaymentMethodInvalidError();
        }

        return new Promise((resolve, reject) => {
            this.localPaymentInstance?.startPayment(
                {
                    paymentType: payment.methodId,
                    amount: cartAmount,
                    fallback: {
                        url: 'url-placeholder',
                        buttonText: 'button placeholder',
                    },
                    currencyCode: currency.code,
                    shippingAddressRequired: isShippingRequired,
                    email,
                    givenName: firstName,
                    surname: lastName,
                    address: {
                        countryCode,
                    },
                    onPaymentStart: (data: onPaymentStartData, start: () => void) => {
                        // Call start to initiate the popup
                        this.orderId = data.paymentId;
                        start();
                    },
                },
                async (
                    startPaymentError: StartPaymentError | null,
                    payloadData: LocalPaymentsPayload,
                ) => {
                    if (startPaymentError) {
                        if (startPaymentError.code !== 'LOCAL_PAYMENT_WINDOW_CLOSED') {
                            reject(() => this.handleError(startPaymentError));
                        }

                        this.toggleLoadingIndicator(false);
                        reject();
                    } else {
                        if (!this.orderId) {
                            throw PaymentMethodInvalidError;
                        }

                        const paymentData = {
                            formattedPayload: {
                                device_info: sessionId || null,
                                method: payment.methodId,
                                [`${payment.methodId}_account`]: {
                                    email: cart.email,
                                    token: payloadData.nonce,
                                    order_id: this.orderId,
                                },
                                vault_payment_instrument: null,
                                set_as_default_stored_instrument: null,
                            },
                        };

                        try {
                            await this.paymentIntegrationService.submitOrder(order, options);
                            await this.paymentIntegrationService.submitPayment({
                                methodId: payment.methodId,
                                paymentData,
                            });
                            resolve();
                        } catch (error: unknown) {
                            reject(() => this.handleError(error));
                        }
                    }
                },
            );
        });
    }

    private getLocalPaymentInstance(localPaymentInstance: LocalPaymentInstance) {
        if (!this.localPaymentInstance) {
            this.localPaymentInstance = localPaymentInstance;
        }
    }

    /**
     *
     * Loading Indicator methods
     *
     * */
    private toggleLoadingIndicator(isLoading: boolean): void {
        if (isLoading && this.loadingIndicatorContainer) {
            this.loadingIndicator.show(this.loadingIndicatorContainer);
        } else {
            this.loadingIndicator.hide();
        }
    }

    private handleError(error: unknown) {
        const { onError } = this.braintreeLocalMethods || {};

        this.toggleLoadingIndicator(false);

        if (onError && typeof onError === 'function') {
            onError(error);
        }
    }
}
