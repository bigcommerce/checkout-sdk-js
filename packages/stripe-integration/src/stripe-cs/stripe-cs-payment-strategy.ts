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
    isStripePaymentEvent,
    isStripePaymentMethodLike,
    StripeAdditionalActionRequired,
    StripeCheckoutInstance,
    StripeCheckoutSession,
    StripeCheckoutSessionActions,
    StripeCheckoutSessionPaymentStatus,
    StripeClient,
    StripeElement,
    StripeElementEvent,
    StripeElementsCreateOptions,
    StripeEventType,
    StripeInitializationData,
    StripeIntegrationService,
    StripeJsVersion,
    StripeScriptLoader,
    StripeStringConstants,
} from '@bigcommerce/checkout-sdk/stripe-utils';

import StripeOCSPaymentInitializeOptions, {
    WithStripeOCSPaymentInitializeOptions,
} from '../stripe-ocs/stripe-ocs-initialize-options';

export default class StripeCSPaymentStrategy implements PaymentStrategy {
    private stripeClient?: StripeClient;
    private stripeCheckout?: StripeCheckoutInstance;
    private selectedMethodId?: string;

    constructor(
        private readonly paymentIntegrationService: PaymentIntegrationService,
        private readonly scriptLoader: StripeScriptLoader,
        private readonly stripeIntegrationService: StripeIntegrationService,
    ) {}

    async initialize(
        options: PaymentInitializeOptions & WithStripeOCSPaymentInitializeOptions,
    ): Promise<void> {
        const { stripeocs, methodId, gatewayId } = options;

        if (!stripeocs?.containerId || !gatewayId) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        try {
            await this._initializeStripeElement(stripeocs, gatewayId, methodId);

            await this._initAdaptivePricing();
        } catch (error) {
            if (error instanceof Error) {
                stripeocs.onError?.(error);
            }
        }
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

        await this._updateCheckoutSessionData(gatewayId, methodId);

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
        const paymentElement = this.stripeCheckout?.getPaymentElement();

        paymentElement?.unmount();
        paymentElement?.destroy();
        this.stripeCheckout = undefined;
        this.stripeClient = undefined;
        this.selectedMethodId = undefined;

        return Promise.resolve();
    }

    private async _initializeStripeElement(
        stripe: StripeOCSPaymentInitializeOptions,
        gatewayId: string,
        methodId: string,
    ) {
        let paymentMethod = this.paymentIntegrationService
            .getState()
            .getPaymentMethodOrThrow<StripeInitializationData>(methodId, gatewayId);

        if (!paymentMethod?.clientToken) {
            const state = await this.paymentIntegrationService.loadPaymentMethod(gatewayId, {
                params: { method: methodId },
            });

            paymentMethod = state.getPaymentMethodOrThrow<StripeInitializationData>(
                methodId,
                gatewayId,
            );
        }

        if (!isStripePaymentMethodLike(paymentMethod)) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const { clientToken, initializationData } = paymentMethod;

        if (!clientToken) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        this.stripeClient = await this._loadStripeJs(initializationData);

        const { enableLink } = initializationData;
        const {
            appearance,
            containerId,
            fonts,
            layout,
            render,
            paymentMethodSelect,
            handleClosePaymentMethod,
            togglePreloader,
        } = stripe;

        const { getBillingAddress, getShippingAddress } = this.paymentIntegrationService.getState();
        const billingAddress = getBillingAddress();
        const { postalCode } = getShippingAddress() || billingAddress || {};

        this.stripeCheckout = await this.scriptLoader.getStripeCheckout(this.stripeClient, {
            clientSecret: clientToken,
            elementsOptions: {
                appearance,
                fonts,
            },
            adaptivePricing: {
                allowed: true,
            },
        });

        const stripeActions = await this._getStripeActionsOrThrow();

        await stripeActions.updateEmail(billingAddress?.email || '');

        const stripeElement = this._getStripeElement({
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
                link: enableLink ? StripeStringConstants.AUTO : StripeStringConstants.NEVER,
            },
            layout,
        });

        if (!stripeElement) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        this.stripeIntegrationService.mountElement(stripeElement, containerId);

        stripeElement.on(StripeElementEvent.LOADER_START, () => {
            togglePreloader?.(false);
        });

        stripeElement.on(StripeElementEvent.READY, () => {
            render();
        });

        stripeElement.on(StripeElementEvent.CHANGE, (event: StripeEventType) => {
            this._onStripeElementChange(event, gatewayId, methodId, paymentMethodSelect);

            (async () => {
                const stripeActions = await this._getStripeActionsOrThrow();
                const stripeCheckoutSession: StripeCheckoutSession | undefined = await stripeActions.getSession?.();

                console.log('*** stripeCheckoutSession', stripeCheckoutSession);
            })();
        });

        handleClosePaymentMethod?.(this._collapseStripeElement.bind(this));
    }

    private async _loadStripeJs(
        initializationData: StripeInitializationData,
    ): Promise<StripeClient> {
        if (this.stripeClient) {
            return this.stripeClient;
        }

        const state = this.paymentIntegrationService.getState();

        return this.scriptLoader.getStripeClient(
            initializationData,
            state.getCartLocale(),
            StripeJsVersion.CLOVER,
        );
    }

    private async _getStripeActionsOrThrow(): Promise<StripeCheckoutSessionActions> {
        if (!this.stripeCheckout) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        const { actions, error } = await this.stripeCheckout.loadActions();

        if (!actions || error) {
            throw new PaymentMethodFailedError(error?.message);
        }

        return actions;
    }

    private _getStripeElement(options?: StripeElementsCreateOptions): StripeElement | undefined {
        return (
            this.stripeCheckout?.getPaymentElement() ||
            this.stripeCheckout?.createPaymentElement(options)
        );
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

    private _collapseStripeElement() {
        const stripeElement = this.stripeCheckout?.getPaymentElement();

        stripeElement?.collapse();
    }

    private async _updateCheckoutSessionData(gatewayId: string, methodId: string): Promise<void> {
        // INFO: to trigger checkout session data update on the BE side we need to make stripe config request
        await this.paymentIntegrationService.loadPaymentMethod(gatewayId, {
            params: { method: methodId },
        });
    }

    private _getPaymentPayload(methodId: string, token: string): Payment {
        const cartId = this.paymentIntegrationService.getState().getCart()?.id || '';

        const formattedPayload = {
            cart_id: cartId,
            confirm: false,
            method: this.selectedMethodId,
            credit_card_token: { token },
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

        const { data: additionalActionData } = error.body?.additional_action_required || {};
        const { token } = additionalActionData || {};

        const { id: checkoutSessionId, status: checkoutSessionStatus } =
            await this._confirmStripePaymentOrThrow(additionalActionData);

        const paymentPayload = this._getPaymentPayload(methodId, checkoutSessionId || token);

        try {
            return await this.paymentIntegrationService.submitPayment(paymentPayload);
        } catch (error) {
            if (checkoutSessionStatus.paymentStatus === StripeCheckoutSessionPaymentStatus.Paid) {
                this.stripeIntegrationService.throwPaymentConfirmationProceedMessage();
            }

            throw error;
        }
    }

    private async _confirmStripePaymentOrThrow(
        additionalActionData: StripeAdditionalActionRequired['data'],
    ): Promise<StripeCheckoutSession | never> {
        const { redirect_url } = additionalActionData || {};

        if (!this.stripeCheckout) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        const stripeActions = await this._getStripeActionsOrThrow();

        const { session: stripeCheckoutSession, error: stripeError } = await stripeActions.confirm({
            redirect: StripeStringConstants.IF_REQUIRED,
            returnUrl: redirect_url,
        });

        if (stripeError || !stripeCheckoutSession) {
            throw new PaymentMethodFailedError(stripeError?.message);
        }

        return stripeCheckoutSession;
    }

    private async _initAdaptivePricing(): Promise<void> {
        if (!this.stripeCheckout) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        try {
            const stripeActions = await this._getStripeActionsOrThrow();
            const stripeCheckoutSession: StripeCheckoutSession | undefined = await stripeActions.getSession?.();
            const totalElement: HTMLElement | null = document.getElementById('stripe-total');
            const currencySelectorHTMLElement: HTMLElement | null = document.getElementById('stripe-currency-selector');
            console.log('*** totalElement', totalElement);
            console.log('*** currencySelectorHTMLElement', currencySelectorHTMLElement);

            console.log('*** stripeCheckoutSession', stripeCheckoutSession);

            if (totalElement) {
                totalElement.textContent = stripeCheckoutSession?.total.total.amount.toString() || '';
            }

            const currencySelectorElement = this._getCurrencySelectorElement();

            console.log('*** currencySelectorElement', currencySelectorElement);

            if (currencySelectorElement) {
                currencySelectorElement.mount('#stripe-currency-selector');
            }
        } catch (error) {
            console.error('*** error', error);
        }

    }

    private _getCurrencySelectorElement(): StripeElement | undefined {
        return this.stripeCheckout?.getCurrencySelectorElement() || this.stripeCheckout?.createCurrencySelectorElement();
    }
}
