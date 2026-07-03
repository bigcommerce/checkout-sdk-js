import { cloneDeep, merge } from 'lodash';

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
    PaymentMethod,
    PaymentMethodFailedError,
    PaymentRequestOptions,
    PaymentStrategy,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    isStripePaymentEvent,
    StripeAdditionalActionRequired,
    StripeCheckoutInstance,
    StripeCheckoutSessionActionResult,
    StripeCheckoutSessionActions,
    StripeCheckoutSessionPaymentStatus,
    StripeClient,
    StripeElement,
    StripeElementEvent,
    StripeElementsCreateOptions,
    StripeEventType,
    StripeFormattedPaymentPayload,
    StripeInitializationData,
    StripeIntegrationService,
    StripeJsVersion,
    StripePaymentMethodType,
    StripeScriptLoader,
    StripeSelectedPaymentMethod,
    StripeStringConstants,
} from '@bigcommerce/checkout-sdk/stripe-utils';

import StripeOCSPaymentInitializeOptions, {
    WithStripeOCSPaymentInitializeOptions,
} from '../stripe-ocs/stripe-ocs-initialize-options';

export default class StripeCSPaymentStrategy implements PaymentStrategy {
    private stripeClient?: StripeClient;
    private stripeCheckout?: StripeCheckoutInstance;
    private selectedMethod?: StripeSelectedPaymentMethod;
    private stripeInitializationOptions?: StripeOCSPaymentInitializeOptions;

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

        let paymentMethod = this.paymentIntegrationService
            .getState()
            .getPaymentMethodOrThrow<StripeInitializationData>(methodId, gatewayId);

        if (!paymentMethod?.clientToken) {
            await this.paymentIntegrationService.loadPaymentMethod(gatewayId, {
                params: { method: methodId },
            });

            paymentMethod = this.paymentIntegrationService
                .getState()
                .getPaymentMethodOrThrow<StripeInitializationData>(methodId, gatewayId);
        }

        this.stripeInitializationOptions = stripeocs;

        try {
            await this._initStripeCheckoutSession(stripeocs, paymentMethod);

            const stripeActions = await this._getStripeActionsOrThrow();

            await this._updateStripeShopperData(stripeActions);
            this._initializePaymentElement(stripeocs, paymentMethod);
            this._initializeAdaptivePricingElement(stripeocs, paymentMethod);
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

        const [, stripeActions] = await Promise.all([
            this._applyStoreCreditIfNeeded(),
            this._getStripeActionsOrThrow(),
        ]);

        await this._updateCheckoutSessionData(gatewayId, methodId, stripeActions);
        await this.paymentIntegrationService.submitOrder(order, options);

        const { id: stripeSessionId } = await stripeActions.getSession();

        const { clientToken } = this.paymentIntegrationService
            .getState()
            .getPaymentMethodOrThrow(methodId, gatewayId);
        const paymentPayload = this._getPaymentPayload(
            methodId,
            stripeSessionId || clientToken || '',
        );

        try {
            await this.paymentIntegrationService.submitPayment(paymentPayload);
        } catch (error) {
            await this._processAdditionalAction(error, gatewayId, methodId);
        }
    }

    finalize(): Promise<void> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(): Promise<void> {
        const paymentElement = this.stripeCheckout?.getPaymentElement();
        const currencySelectorElement = this.stripeCheckout?.getCurrencySelectorElement();

        paymentElement?.unmount();
        paymentElement?.destroy();
        currencySelectorElement?.unmount();
        currencySelectorElement?.destroy();
        this.stripeCheckout = undefined;
        this.stripeClient = undefined;
        this.selectedMethod = undefined;
        this.stripeInitializationOptions = undefined;

        return Promise.resolve();
    }

    private async _initStripeCheckoutSession(
        stripe: StripeOCSPaymentInitializeOptions,
        paymentMethod: PaymentMethod<StripeInitializationData>,
    ): Promise<void> {
        const { clientToken, initializationData } = paymentMethod;

        if (!clientToken || !initializationData) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        this.stripeClient = await this._loadStripeJs(initializationData);

        const { appearance, fonts } = stripe;

        this.stripeCheckout = await this.scriptLoader.getStripeCheckout(this.stripeClient, {
            clientSecret: clientToken,
            elementsOptions: {
                appearance,
                fonts,
            },
            adaptivePricing: {
                allowed: !!initializationData?.adaptivePricingEnabled,
            },
        });
    }

    private _initializePaymentElement(
        stripe: StripeOCSPaymentInitializeOptions,
        paymentMethod: PaymentMethod<StripeInitializationData>,
    ) {
        const { initializationData, id: methodId, gateway } = paymentMethod;

        const { enableLink } = initializationData || {};
        const {
            containerId,
            layout,
            paymentMethodSelect,
            handleClosePaymentMethod,
            togglePreloader,
        } = stripe;

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

        if (!stripeElement || !gateway) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        this.stripeIntegrationService.mountElement(stripeElement, containerId);

        stripeElement.on(StripeElementEvent.LOADER_START, () => {
            togglePreloader?.(false);
        });

        stripeElement.on(StripeElementEvent.READY, () => {
            this._rerenderPlaceholderButton();
        });

        stripeElement.on(StripeElementEvent.CHANGE, (event: StripeEventType) => {
            this._onStripeElementChange(event, gateway, methodId, paymentMethodSelect);
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

    private async _applyStoreCreditIfNeeded(): Promise<void> {
        const { isStoreCreditApplied } = this.paymentIntegrationService
            .getState()
            .getCheckoutOrThrow();

        if (isStoreCreditApplied) {
            await this.paymentIntegrationService.applyStoreCredit(isStoreCreditApplied);
        }
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

        this.selectedMethod = event.value;
        paymentMethodSelect?.(`${gatewayId}-${methodId}`);
    }

    private _collapseStripeElement() {
        const stripeElement = this.stripeCheckout?.getPaymentElement();

        stripeElement?.collapse();
    }

    private async _updateCheckoutSessionData(
        gatewayId: string,
        methodId: string,
        stripeActions: StripeCheckoutSessionActions,
    ): Promise<void> {
        await this._updateStripeShopperData(stripeActions);

        // INFO: to trigger checkout session data update on the BE side we need to make stripe config request
        await this.paymentIntegrationService.loadPaymentMethod(gatewayId, {
            params: { method: methodId },
        });
    }

    private _getPaymentPayload(
        methodId: string,
        token: string,
        isSecondPaymentRequest = false,
    ): Payment<StripeFormattedPaymentPayload> {
        const cartId = this.paymentIntegrationService.getState().getCart()?.id || '';
        const tokenizedOptions = this._getTokenizedOptions(token, isSecondPaymentRequest);

        const formattedPayload = {
            cart_id: cartId,
            confirm: false,
            method: this.selectedMethod?.type,
            vault_payment_instrument:
                isSecondPaymentRequest && !!this.selectedMethod?.savePaymentMethod,
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
        gatewayId: string,
        methodId: string,
    ): Promise<PaymentIntegrationSelectors | undefined> {
        if (!isRequestError(error)) {
            throw error;
        } else if (this.stripeIntegrationService.isSessionExpiredError(error.body.errors)) {
            // INFO: await is skipped here to not block error propagation and update checkout session in the background
            this._reinitializeStrategy({
                gatewayId,
                methodId,
                stripeocs: cloneDeep(this.stripeInitializationOptions),
            });

            throw error;
        } else if (!this.stripeIntegrationService.isAdditionalActionError(error.body.errors)) {
            throw error;
        }

        const { data: additionalActionData } = error.body?.additional_action_required || {};
        const { token } = additionalActionData || {};
        const { session: stripeCheckoutSession, error: stripeError } =
            await this._confirmStripePayment(additionalActionData);
        const { id: checkoutSessionId, status: checkoutSessionStatus } =
            stripeCheckoutSession || {};
        const paymentPayload = this._getPaymentPayload(methodId, checkoutSessionId || token, true);
        const { initializationData } = this.paymentIntegrationService
            .getState()
            .getPaymentMethodOrThrow<StripeInitializationData>(methodId, gatewayId);
        const { sendSecondPaymentRequestOnStripeError } = initializationData || {};

        if (stripeError || !stripeCheckoutSession) {
            if (sendSecondPaymentRequestOnStripeError) {
                // INFO: even in case when stripe payment confirmation was declined
                // we need to send submitPayment request to update status of checkout session on BE side.
                try {
                    const paymentPayloadWithError = merge({}, paymentPayload, {
                        paymentData: {
                            formattedPayload: {
                                client_side_error: true,
                            },
                        },
                    });

                    return await this.paymentIntegrationService.submitPayment(
                        paymentPayloadWithError,
                    );
                } catch {
                    // INFO: additional action should be ignored for this update status request.
                    // will throw Stripe error message to the shopper.
                }
            }

            throw new PaymentMethodFailedError(stripeError?.message);
        }

        try {
            return await this.paymentIntegrationService.submitPayment(paymentPayload);
        } catch (error) {
            if (checkoutSessionStatus?.paymentStatus === StripeCheckoutSessionPaymentStatus.Paid) {
                this.stripeIntegrationService.throwPaymentConfirmationProceedMessage();
            }

            throw error;
        }
    }

    private async _confirmStripePayment(
        additionalActionData: StripeAdditionalActionRequired['data'],
    ): Promise<StripeCheckoutSessionActionResult | never> {
        const { redirect_url } = additionalActionData || {};

        if (!this.stripeCheckout) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        const stripeActions = await this._getStripeActionsOrThrow();

        return stripeActions.confirm({
            redirect: StripeStringConstants.IF_REQUIRED,
            returnUrl: redirect_url,
        });
    }

    private async _updateStripeShopperData(
        stripeActions: StripeCheckoutSessionActions,
    ): Promise<void> {
        await this._updateStripeEmail(stripeActions);
        await this._updateStripeShippingAddress(stripeActions);
        await this._updateStripeBillingAddress(stripeActions);
    }

    private async _updateStripeEmail(stripeActions: StripeCheckoutSessionActions): Promise<void> {
        const stripeCheckoutSession = await stripeActions.getSession();

        if (stripeCheckoutSession.email) {
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

    private _getTokenizedOptions(token: string, shouldTriggerVaultingFlow: boolean) {
        const { type, savePaymentMethod } = this.selectedMethod || {};

        if (
            shouldTriggerVaultingFlow &&
            savePaymentMethod &&
            type === StripePaymentMethodType.ACH
        ) {
            return { tokenized_ach: { token } };
        }

        return { credit_card_token: { token } };
    }

    private _initializeAdaptivePricingElement(
        stripe: StripeOCSPaymentInitializeOptions,
        paymentMethod: PaymentMethod<StripeInitializationData>,
    ): void {
        const { initializationData } = paymentMethod;
        const { currencySelectorContainerId } = stripe;

        if (!initializationData?.adaptivePricingEnabled) {
            return;
        }

        if (!currencySelectorContainerId) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        const currencySelectorElement = this._getCurrencySelectorElement();

        if (!currencySelectorElement) {
            return;
        }

        currencySelectorElement.mount(`#${currencySelectorContainerId}`);

        this._initAdaptivePricingEvents(currencySelectorElement);
    }

    private _getCurrencySelectorElement(): StripeElement | undefined {
        return (
            this.stripeCheckout?.getCurrencySelectorElement() ||
            this.stripeCheckout?.createCurrencySelectorElement()
        );
    }

    private _initAdaptivePricingEvents(currencySelectorElement: StripeElement): void {
        currencySelectorElement.on(StripeElementEvent.CHANGE, async (event: StripeEventType) => {
            if (!event.value || !('currency' in event.value)) {
                return;
            }

            const { currency } = this.paymentIntegrationService.getState().getCartOrThrow();
            const currencyCode = currency.code.toLowerCase();
            const stripeCurrencyCode = event.value.currency.toLowerCase();

            await this.paymentIntegrationService.updatePaymentProviderCustomer({
                isCustomerCurrencySelected: currencyCode !== stripeCurrencyCode,
                customerCurrency: stripeCurrencyCode,
            });

            this._rerenderPlaceholderButton();
        });
    }

    private async _reinitializeStrategy(
        options: PaymentInitializeOptions & WithStripeOCSPaymentInitializeOptions,
    ): Promise<void> {
        await this.deinitialize();
        await this.initialize(options);
    }

    private _rerenderPlaceholderButton(): void {
        const { render } = this.stripeInitializationOptions || {};

        render?.();
    }
}
