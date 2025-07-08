import {
    InvalidArgumentError,
    isRequestError,
    MissingDataError,
    MissingDataErrorType,
    NotInitializedError,
    NotInitializedErrorType,
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    Payment,
    PaymentInitializeOptions,
    PaymentIntegrationSelectors,
    PaymentIntegrationService,
    PaymentMethodFailedError,
    PaymentRequestOptions,
    PaymentStrategy,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import {
    formatLocale,
    isStripePaymentEvent,
    isStripePaymentMethodLike,
    StripeAdditionalActionRequired,
    StripeClient,
    StripeElement,
    StripeElementEvent,
    StripeElements,
    StripeElementType,
    StripeError,
    StripeEventType,
    StripeInitializationData,
    StripeIntegrationService,
    StripeResult,
    StripeScriptLoader,
    StripeStringConstants,
} from '../stripe-utils';

import StripeOCSPaymentInitializeOptions, {
    WithStripeOCSPaymentInitializeOptions,
} from './stripe-ocs-initialize-options';

export default class StripeOCSPaymentStrategy implements PaymentStrategy {
    private stripeClient?: StripeClient;
    private stripeElements?: StripeElements;
    private selectedMethodId?: string;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private scriptLoader: StripeScriptLoader,
        private stripeIntegrationService: StripeIntegrationService,
    ) {}

    async initialize(
        options: PaymentInitializeOptions & WithStripeOCSPaymentInitializeOptions,
    ): Promise<void> {
        console.log('StripeOCSPaymentStrategy vaulting TEST');
        const { stripeocs, methodId, gatewayId } = options;

        if (!stripeocs?.containerId) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        if (!gatewayId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "gatewayId" argument is not provided.',
            );
        }

        try {
            await this._initializeStripeElement(stripeocs, gatewayId, methodId);
        } catch (error) {
            if (error instanceof Error) {
                stripeocs.onError?.(error);
            }
        }

        this.stripeIntegrationService.initCheckoutEventsSubscription(
            gatewayId,
            methodId,
            stripeocs,
            this.stripeElements,
        );
    }

    async execute(orderRequest: OrderRequestBody, options?: PaymentRequestOptions): Promise<void> {
        const { payment, ...order } = orderRequest;
        const { methodId, gatewayId } = payment || {};

        if (!this.stripeClient) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        if (!gatewayId || !methodId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "gatewayId" or "methodId" argument is not provided.',
            );
        }

        const state = this.paymentIntegrationService.getState();
        const { isStoreCreditApplied } = state.getCheckoutOrThrow();

        if (isStoreCreditApplied) {
            await this.paymentIntegrationService.applyStoreCredit(isStoreCreditApplied);
        }

        await this.stripeIntegrationService.updateStripePaymentIntent(gatewayId, methodId);

        await this.paymentIntegrationService.submitOrder(order, options);

        const { clientToken } = state.getPaymentMethodOrThrow(methodId);
        const paymentPayload = this._getPaymentPayload(methodId, clientToken || '');

        try {
            await this.paymentIntegrationService.submitPayment(paymentPayload);
        } catch (error) {
            await this._processAdditionalAction(error, methodId);
        }
    }

    finalize(): Promise<void> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(): Promise<void> {
        this.stripeElements?.getElement(StripeElementType.PAYMENT)?.unmount();
        this.stripeIntegrationService.deinitialize();
        this.stripeElements = undefined;
        this.stripeClient = undefined;

        return Promise.resolve();
    }

    private async _initializeStripeElement(
        stripe: StripeOCSPaymentInitializeOptions,
        gatewayId: string,
        methodId: string,
    ) {
        let paymentMethod = this.paymentIntegrationService
            .getState()
            .getPaymentMethodOrThrow(methodId);

        if (!paymentMethod?.clientToken) {
            const state = await this.paymentIntegrationService.loadPaymentMethod(gatewayId, {
                params: { method: methodId },
            });

            paymentMethod = state.getPaymentMethodOrThrow(methodId);
        }

        if (!isStripePaymentMethodLike(paymentMethod)) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const { clientToken, initializationData } = paymentMethod;
        const { shopperLanguage, customerSessionToken } = initializationData;

        if (!clientToken) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        this.stripeClient = await this._loadStripeJs(initializationData);

        const {
            appearance,
            containerId,
            fonts,
            layout,
            render,
            paymentMethodSelect,
            handleClosePaymentMethod,
        } = stripe;

        this.stripeElements = await this.scriptLoader.getElements(this.stripeClient, {
            clientSecret: clientToken,
            customerSessionClientSecret: customerSessionToken,
            locale: formatLocale(shopperLanguage),
            appearance,
            fonts,
        });

        const { getBillingAddress, getShippingAddress } = this.paymentIntegrationService.getState();
        const { postalCode } = getShippingAddress() || getBillingAddress() || {};

        const stripeElement: StripeElement =
            this.stripeElements.getElement(StripeElementType.PAYMENT) ||
            this.stripeElements.create(StripeElementType.PAYMENT, {
                fields: {
                    billingDetails: {
                        email: StripeStringConstants.NEVER,
                        address: {
                            country: StripeStringConstants.NEVER,
                            city: StripeStringConstants.NEVER,
                            postalCode: postalCode
                                ? StripeStringConstants.NEVER
                                : StripeStringConstants.AUTO,
                        },
                    },
                },
                wallets: {
                    applePay: StripeStringConstants.NEVER,
                    googlePay: StripeStringConstants.NEVER,
                },
                layout,
                savePaymentMethod: {
                    maxVisiblePaymentMethods: 20,
                },
            });

        this.stripeIntegrationService.mountElement(stripeElement, containerId);

        stripeElement.on(StripeElementEvent.READY, () => {
            render();
        });

        stripeElement.on(StripeElementEvent.CHANGE, (event: StripeEventType) => {
            this._onStripeElementChange(event, gatewayId, methodId, paymentMethodSelect);
        });

        handleClosePaymentMethod?.(this._collapseStripeElement.bind(this));
    }

    private async _loadStripeJs(
        initializationData: StripeInitializationData,
    ): Promise<StripeClient> {
        if (this.stripeClient) {
            return this.stripeClient;
        }

        return this.scriptLoader.getStripeClient(initializationData);
    }

    private _collapseStripeElement() {
        const stripeElement = this.stripeElements?.getElement(StripeElementType.PAYMENT);

        stripeElement?.collapse();
    }

    private _getPaymentPayload(methodId: string, token: string, shouldSaveInstrument = false): Payment {
        const cartId = this.paymentIntegrationService.getState().getCart()?.id || '';
        const formattedPayload = {
            cart_id: cartId,
            credit_card_token: { token },
            confirm: false,
            payment_method_id: this.selectedMethodId,
            vault_payment_instrument: shouldSaveInstrument,
        };

        return {
            methodId,
            paymentData: {
                formattedPayload,
            },
        };
    }

    private async _processAdditionalAction(
        error: unknown,
        methodId: string,
    ): Promise<PaymentIntegrationSelectors | undefined> {
        if (
            !isRequestError(error) ||
            !this.stripeIntegrationService.isAdditionalActionError(error.body.errors)
        ) {
            throw error;
        }

        if (!this.stripeClient || !this.stripeElements) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        const { data: additionalActionData } = error.body.additional_action_required;
        const { token } = additionalActionData;

        const { paymentIntent } = await this._confirmStripePaymentOrThrow(
            methodId,
            additionalActionData,
        );

        const shouldSaveCard = this._shouldSaveCard(paymentIntent);
        const paymentPayload = this._getPaymentPayload(methodId, paymentIntent?.id || token, shouldSaveCard);

        try {
            return await this.paymentIntegrationService.submitPayment(paymentPayload);
        } catch (error) {
            this.stripeIntegrationService.throwPaymentConfirmationProceedMessage();
        }
    }

    private _shouldSaveCard(options: StripeResult['paymentIntent']) {
        console.log('options', options);

        const futureUsage =  options?.payment_method_options?.card?.setup_future_usage;
        return  futureUsage && (futureUsage === 'on_session' || futureUsage === 'off_session');
    }

    private async _confirmStripePaymentOrThrow(
        methodId: string,
        additionalActionData: StripeAdditionalActionRequired['data'],
    ): Promise<StripeResult | never> {
        const { token, redirect_url } = additionalActionData;
        const stripePaymentData = this.stripeIntegrationService.mapStripePaymentData(
            this.stripeElements,
            redirect_url,
        );
        let stripeError: StripeError | undefined;

        try {
            const isPaymentCompleted = await this.stripeIntegrationService.isPaymentCompleted(
                methodId,
                this.stripeClient,
            );

            const confirmationResult = !isPaymentCompleted
                ? await this.stripeClient?.confirmPayment(stripePaymentData)
                : await this.stripeClient?.retrievePaymentIntent(token || '');

            stripeError = confirmationResult?.error;

            if (stripeError || !confirmationResult?.paymentIntent) {
                throw new PaymentMethodFailedError();
            }

            return confirmationResult;
        } catch (error: unknown) {
            return this.stripeIntegrationService.throwStripeError(stripeError);
        }
    }

    private _onStripeElementChange(
        event: StripeEventType,
        gatewayId: string,
        methodId: string,
        paymentMethodSelect?: (id: string) => void,
    ) {
        if (!isStripePaymentEvent(event) || event.collapsed) {
            return;
        }

        this.selectedMethodId = event.value.type;
        paymentMethodSelect?.(`${gatewayId}-${methodId}`);
    }
}
