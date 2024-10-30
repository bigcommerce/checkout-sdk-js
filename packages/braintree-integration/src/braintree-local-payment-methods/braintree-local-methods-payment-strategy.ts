import {
    BraintreeInitializationData,
    BraintreeIntegrationService,
    BraintreeLocalPaymentMethodRedirectAction,
    BraintreeRedirectError,
    LocalPaymentInstance,
    LocalPaymentsPayload,
    NonInstantLocalPaymentMethods,
    onPaymentStartData,
    StartPaymentError,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import {
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    OrderFinalizationNotRequiredError,
    OrderPaymentRequestBody,
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
    BraintreeLocalMethods,
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
            this.braintreeIntegrationService.initialize(clientToken);
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
        const sessionId = await this.braintreeIntegrationService.getSessionId();

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        this.toggleLoadingIndicator(true);

        return this.isNonInstantPaymentMethod(payment.methodId)
            ? this.executeWithNotInstantLPM(payment, sessionId)
            : this.executeWithInstantLPM(payment.methodId, order, options, sessionId);
    }

    private async executeWithNotInstantLPM(
        payment: OrderPaymentRequestBody,
        sessionId?: string,
    ): Promise<void> {
        const { methodId } = payment;

        const paymentData = {
            formattedPayload: {
                vault_payment_instrument: null,
                set_as_default_stored_instrument: null,
                method: methodId,
                device_info: sessionId || null,
            },
        };

        await this.paymentIntegrationService.submitOrder();

        try {
            await this.paymentIntegrationService.submitPayment({
                methodId,
                paymentData,
            });
        } catch (error) {
            if (this.isBraintreeRedirectError(error)) {
                const redirectUrl = error.body.additional_action_required.data.redirect_url;

                return new Promise((_, reject) => {
                    window.location.replace(redirectUrl);

                    this.toggleLoadingIndicator(false);

                    reject();
                });
            }

            this.toggleLoadingIndicator(false);

            return Promise.reject(error);
        }
    }

    private async executeWithInstantLPM(
        methodId: string,
        order: Omit<OrderRequestBody, 'payment'>,
        options?: PaymentRequestOptions,
        sessionId?: string,
    ): Promise<void> {
        if (!this.localPaymentInstance) {
            throw new PaymentMethodInvalidError();
        }

        const state = this.paymentIntegrationService.getState();
        const cart = state.getCartOrThrow();
        const billing = state.getBillingAddressOrThrow();
        const { firstName, lastName, countryCode } = billing;
        const { currency, email, lineItems } = cart;
        const isShippingRequired = lineItems.physicalItems.length > 0;
        const grandTotal = state.getCheckoutOrThrow().outstandingBalance;

        return new Promise((resolve, reject) => {
            this.localPaymentInstance?.startPayment(
                {
                    paymentType: methodId,
                    amount: grandTotal,
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
                                method: methodId,
                                [`${methodId}_account`]: {
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
                                methodId,
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

    /**
     *
     * Utils
     *
     * */
    private isNonInstantPaymentMethod(methodId: string): boolean {
        return methodId.toUpperCase() in NonInstantLocalPaymentMethods;
    }

    private isBraintreeRedirectError(error: unknown): error is BraintreeRedirectError {
        if (typeof error !== 'object' || error === null) {
            return false;
        }

        const { body }: Partial<BraintreeLocalPaymentMethodRedirectAction> = error;

        if (!body) {
            return false;
        }

        return !!body.additional_action_required?.data.redirect_url;
    }
}
