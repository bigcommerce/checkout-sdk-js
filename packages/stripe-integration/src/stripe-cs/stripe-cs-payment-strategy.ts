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
    StripePaymentMethodType,
    StripeSavedPaymentMethod,
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

        const { clientToken } = this.paymentIntegrationService
            .getState()
            .getPaymentMethodOrThrow<StripeInitializationData>(methodId, gatewayId);

        if (!clientToken) {
            await this.paymentIntegrationService.loadPaymentMethod(gatewayId, {
                params: { method: methodId },
            });
        }

        try {
            await this._initializeStripeElement(stripeocs, gatewayId, methodId);
            await this._updateStripeShopperData();
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

        const { clientToken } = state.getPaymentMethodOrThrow(methodId, gatewayId);
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
        const { clientToken, initializationData } = this.paymentIntegrationService
            .getState()
            .getPaymentMethodOrThrow<StripeInitializationData>(methodId, gatewayId);

        if (!clientToken || !initializationData) {
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

        this.stripeCheckout = await this.scriptLoader.getStripeCheckout(this.stripeClient, {
            clientSecret: clientToken,
            elementsOptions: {
                appearance,
                fonts,
            },
            adaptivePricing: {
                allowed: false,
            },
        });

        const stripeElement = this._getStripeElement({
            fields: {
                billingDetails: {
                    email: StripeStringConstants.NEVER,
                    name: StripeStringConstants.NEVER,
                    address: StripeStringConstants.NEVER,
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
        await this._updateStripeShopperData();

        // INFO: to trigger checkout session data update on the BE side we need to make stripe config request
        await this.paymentIntegrationService.loadPaymentMethod(gatewayId, {
            params: { method: methodId },
        });
    }

    private _getPaymentPayload(
        methodId: string,
        token: string,
        newVaultedStripeInstrument?: StripeSavedPaymentMethod,
    ): Payment {
        const cartId = this.paymentIntegrationService.getState().getCart()?.id || '';
        const tokenizedOptions = this._getTokenizedOptions(token, newVaultedStripeInstrument);

        const formattedPayload = {
            cart_id: cartId,
            confirm: false,
            method: this.selectedMethodId,
            vault_payment_instrument: !!newVaultedStripeInstrument,
            ...tokenizedOptions,
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
        const existingStripeSavedPaymentMethods = await this._getStripeSavedPaymentMethodsOrThrow();
        const { id: checkoutSessionId, status: checkoutSessionStatus } =
            await this._confirmStripePaymentOrThrow(additionalActionData);
        const newStripeSavedPaymentMethods = await this._getStripeSavedPaymentMethodsOrThrow();
        const newVaultedStripeInstrument = this._getNewVaultedStripeInstrument(
            existingStripeSavedPaymentMethods,
            newStripeSavedPaymentMethods,
        );

        const paymentPayload = this._getPaymentPayload(
            methodId,
            checkoutSessionId || token,
            newVaultedStripeInstrument,
        );

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

    private async _updateStripeShopperData(): Promise<void> {
        const stripeActions = await this._getStripeActionsOrThrow();

        await this._updateStripeEmail(stripeActions);
        await this._updateStripeShippingAddress(stripeActions);
        await this._updateStripeBillingAddress(stripeActions);
    }

    private async _updateStripeEmail(stripeActions: StripeCheckoutSessionActions): Promise<void> {
        const stripeCheckoutSession = await stripeActions.getSession();

        if (stripeCheckoutSession?.email) {
            return;
        }

        const { getBillingAddress } = this.paymentIntegrationService.getState();
        const billingAddress = getBillingAddress();

        await stripeActions.updateEmail(billingAddress?.email || '');
    }

    private async _updateStripeShippingAddress(
        stripeActions: StripeCheckoutSessionActions,
    ): Promise<void> {
        const shippingAddress = this.paymentIntegrationService.getState().getShippingAddress();

        if (!shippingAddress) {
            return;
        }

        await stripeActions.updateShippingAddress({
            name: this.stripeIntegrationService.getShopperFullName(shippingAddress),
            address: this.stripeIntegrationService.mapStripeAddress(shippingAddress),
        });
    }

    private async _updateStripeBillingAddress(
        stripeActions: StripeCheckoutSessionActions,
    ): Promise<void> {
        const billingAddress = this.paymentIntegrationService.getState().getBillingAddress();

        if (!billingAddress) {
            return;
        }

        await stripeActions.updateBillingAddress({
            name: this.stripeIntegrationService.getShopperFullName(billingAddress),
            address: this.stripeIntegrationService.mapStripeAddress(billingAddress),
        });
    }

    private async _getStripeSavedPaymentMethodsOrThrow(): Promise<StripeSavedPaymentMethod[]> {
        const stripeActions = await this._getStripeActionsOrThrow();
        const { savedPaymentMethods } = (await stripeActions.getSession()) || {};

        return savedPaymentMethods || [];
    }

    private _getNewVaultedStripeInstrument(
        existingStripeSavedPaymentMethods: StripeSavedPaymentMethod[],
        newStripeSavedPaymentMethods: StripeSavedPaymentMethod[],
    ): StripeSavedPaymentMethod | undefined {
        return newStripeSavedPaymentMethods.find(
            (method: StripeSavedPaymentMethod) =>
                !existingStripeSavedPaymentMethods.some(
                    (existingMethod: StripeSavedPaymentMethod) => existingMethod.id === method.id,
                ),
        );
    }

    private _getTokenizedOptions(
        token: string,
        newVaultedStripeInstrument?: StripeSavedPaymentMethod,
    ) {
        if (newVaultedStripeInstrument?.type === StripePaymentMethodType.ACH) {
            return { tokenized_ach: { token } };
        }

        return { credit_card_token: { token } };
    }
}
