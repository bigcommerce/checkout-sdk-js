import {
    BraintreeInitializationData,
    BraintreeLocalPayment,
    BraintreeLocalPaymentConfig,
    BraintreeLocalPaymentMethodRedirectAction,
    BraintreeLocalPaymentsPayload,
    BraintreeLPMPaymentStartData,
    BraintreeLPMStartPaymentError,
    BraintreeOrderSavedResponse,
    BraintreeRedirectError,
    BraintreeSdk,
    NonInstantLocalPaymentMethods,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import {
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentInstrumentMeta,
    PaymentIntegrationService,
    PaymentMethodInvalidError,
    PaymentRequestOptions,
    PaymentStrategy,
    RequestOptions,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { LoadingIndicator } from '@bigcommerce/checkout-sdk/ui';

import {
    BraintreeLocalMethodsPaymentInitializeOptions,
    WithBraintreeLocalMethodsPaymentInitializeOptions,
} from './braintree-local-methods-payment-initialize-options';

export default class BraintreeLocalMethodsPaymentStrategy implements PaymentStrategy {
    private braintreelocalmethods?: BraintreeLocalMethodsPaymentInitializeOptions;
    private braintreeLocalPayment?: BraintreeLocalPayment;
    private loadingIndicatorContainer?: string;
    private orderId?: string;
    private isLPMsUpdateExperimentEnabled = false;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private braintreeSdk: BraintreeSdk,
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

        this.braintreelocalmethods = braintreelocalmethods;
        this.loadingIndicatorContainer = braintreelocalmethods.container.split('#')[1];

        await this.paymentIntegrationService.loadPaymentMethod(gatewayId);

        const state = this.paymentIntegrationService.getState();
        const paymentMethod = state.getPaymentMethodOrThrow<BraintreeInitializationData>(gatewayId);
        const { clientToken, config, initializationData } = paymentMethod;

        this.isLPMsUpdateExperimentEnabled =
            state.getStoreConfigOrThrow().checkoutSettings.features[
                'PAYPAL-4853.add_new_payment_flow_for_braintree_lpms'
            ] || false;

        if (!clientToken || !initializationData || !config.merchantId) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        try {
            this.braintreeSdk.initialize(clientToken);

            if (!this.isNonInstantPaymentMethod(methodId)) {
                this.braintreeLocalPayment = await this.braintreeSdk.getBraintreeLocalPayment(
                    config.merchantId,
                );
            }
        } catch (error: unknown) {
            this.handleError(error);
        }
    }

    finalize(): Promise<void> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    async deinitialize(): Promise<void> {
        this.toggleLoadingIndicator(false);

        return Promise.resolve();
    }

    async execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void> {
        const { payment, ...order } = payload;

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        const { methodId } = payment;

        this.toggleLoadingIndicator(true);

        if (this.isNonInstantPaymentMethod(methodId)) {
            await this.executeWithNotInstantLPM(methodId);
        } else {
            await this.executeWithInstantLPM(methodId, order, options);
        }
    }

    private async executeWithNotInstantLPM(methodId: string): Promise<void> {
        try {
            const basicPaymentData = await this.getLPMsBasicPaymentData();

            await this.paymentIntegrationService.submitOrder();
            await this.paymentIntegrationService.submitPayment({
                methodId,
                paymentData: {
                    ...basicPaymentData,
                    formattedPayload: {
                        method: methodId,
                    },
                },
            });
        } catch (error: unknown) {
            if (this.isBraintreeRedirectError(error)) {
                const redirectUrl = error.body.additional_action_required.data.redirect_url;

                return new Promise((_, reject) => {
                    window.location.replace(redirectUrl);

                    this.toggleLoadingIndicator(false);

                    reject();
                });
            }

            this.handleError(error);

            return Promise.reject(error);
        }
    }

    private async executeWithInstantLPM(
        methodId: string,
        order: Omit<OrderRequestBody, 'payment'>,
        options?: PaymentRequestOptions,
    ): Promise<void> {
        if (!this.braintreeLocalPayment) {
            throw new PaymentMethodInvalidError();
        }

        await new Promise((resolve, reject): void => {
            this.braintreeLocalPayment?.startPayment(
                this.getInstantLPMConfig(methodId, order, options),
                this.getInstantLPMCallback(resolve, reject, methodId, order, options),
            );
        });
    }

    private async getLPMsBasicPaymentData(): Promise<PaymentInstrumentMeta> {
        const { deviceData } = await this.braintreeSdk.getDataCollectorOrThrow();

        return { deviceSessionId: deviceData };
    }

    private getInstantLPMConfig(
        methodId: string,
        order: Omit<OrderRequestBody, 'payment'>,
        options?: RequestOptions,
    ): BraintreeLocalPaymentConfig {
        const state = this.paymentIntegrationService.getState();
        const cart = state.getCartOrThrow();
        const billing = state.getBillingAddressOrThrow();
        const { firstName, lastName, countryCode } = billing;
        const { currency, email, lineItems } = cart;
        const isShippingRequired = lineItems.physicalItems.length > 0;
        const grandTotal = state.getCheckoutOrThrow().outstandingBalance;
        const features = state.getStoreConfigOrThrow().checkoutSettings.features;
        const isBraintreeFallbackUrlExperiment = features['PAYPAL-5187.braintree_lpm_fallback'];
        const checkoutUrl = `${state.getConfig()?.storeConfig?.links?.siteLink ?? ''}/checkout`;
        const fallbackUrl = isBraintreeFallbackUrlExperiment ? checkoutUrl : 'url-placeholder';

        return {
            paymentType: methodId,
            amount: grandTotal,
            fallback: {
                url: fallbackUrl,
                buttonText: 'Complete Payment',
            },
            currencyCode: currency.code,
            shippingAddressRequired: isShippingRequired,
            email,
            givenName: firstName,
            surname: lastName,
            address: {
                countryCode,
            },
            onPaymentStart: async (data: BraintreeLPMPaymentStartData, start: () => void) => {
                if (!this.isLPMsUpdateExperimentEnabled) {
                    this.orderId = data.paymentId;

                    start();

                    return;
                }

                const basicPaymentData = await this.getLPMsBasicPaymentData();
                const paymentData = {
                    ...basicPaymentData,
                    formattedPayload: {
                        method: methodId,
                        [`${methodId}_account`]: {
                            order_id: data.paymentId,
                        },
                    },
                };

                try {
                    // Submit order and payment should be performed to pass order_id to the backend
                    await this.paymentIntegrationService.submitOrder(order, options);
                    await this.paymentIntegrationService.submitPayment({
                        methodId,
                        paymentData,
                    });
                } catch (error: unknown) {
                    if (
                        this.isBraintreeOrderSavedResponse(error) &&
                        error.body.additional_action_required.data.order_id_saved_successfully
                    ) {
                        // Start method call initiates the popup
                        start();

                        return;
                    }

                    throw error;
                }
            },
        };
    }

    private getInstantLPMCallback(
        resolve: (value: unknown) => void,
        reject: (reason?: unknown) => void,
        methodId: string,
        order: Omit<OrderRequestBody, 'payment'>,
        options?: RequestOptions,
    ) {
        const state = this.paymentIntegrationService.getState();
        const cart = state.getCartOrThrow();

        return async (
            startPaymentError: BraintreeLPMStartPaymentError | undefined,
            payloadData: BraintreeLocalPaymentsPayload,
        ) => {
            if (startPaymentError) {
                if (startPaymentError.code === 'LOCAL_PAYMENT_WINDOW_CLOSED') {
                    this.toggleLoadingIndicator(false);

                    return reject();
                }

                this.toggleLoadingIndicator(false);

                return reject(new PaymentMethodInvalidError());
            }

            const basicPaymentData = await this.getLPMsBasicPaymentData();
            const paymentData = {
                ...basicPaymentData,
                formattedPayload: {
                    method: methodId,
                    [`${methodId}_account`]: {
                        email: cart.email,
                        token: payloadData.nonce,
                        ...(!this.isLPMsUpdateExperimentEnabled ? { order_id: this.orderId } : {}),
                    },
                },
            };

            try {
                if (!this.isLPMsUpdateExperimentEnabled) {
                    await this.paymentIntegrationService.submitOrder(order, options);
                }

                await this.paymentIntegrationService.submitPayment({
                    methodId,
                    paymentData,
                });

                return resolve(undefined);
            } catch (error: unknown) {
                this.handleError(error);

                return reject(error);
            }
        };
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
        const { onError } = this.braintreelocalmethods || {};

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

    private isBraintreeOrderSavedResponse(
        response: unknown,
    ): response is BraintreeOrderSavedResponse {
        if (typeof response !== 'object' || response === null) {
            return false;
        }

        const { body }: Partial<BraintreeOrderSavedResponse> = response;

        if (!body) {
            return false;
        }

        return body.additional_action_required?.data.hasOwnProperty('order_id_saved_successfully');
    }
}
