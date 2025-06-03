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
    StripeAppearanceOptions,
    StripeClient,
    StripeElement,
    StripeElementEvent,
    StripeElements,
    StripeElementType,
    StripeError,
    StripeEventType,
    StripeIntegrationService,
    StripeResult,
    StripeScriptLoader,
    StripeStringConstants,
    StripeUPEAppearanceValues,
} from '../stripe-utils';

import StripeOCSPaymentInitializeOptions, {
    WithStripeOCSPaymentInitializeOptions,
} from './stripe-ocs-initialize-options';

export default class StripeOCSPaymentStrategy implements PaymentStrategy {
    private stripeUPEClient?: StripeClient;
    private stripeElements?: StripeElements;
    private selectedMethodId?: string;
    private readonly stripeSVGSizeCoefficient = 0.88;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private scriptLoader: StripeScriptLoader,
        private stripeUPEIntegrationService: StripeIntegrationService,
    ) {}

    async initialize(
        options: PaymentInitializeOptions & WithStripeOCSPaymentInitializeOptions,
    ): Promise<void> {
        const {
            stripeupe: stripeupeInitData,
            stripeocs: stripeocsInitData,
            methodId,
            gatewayId,
        } = options;
        const stripeocs = stripeocsInitData || stripeupeInitData;

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

        this.stripeUPEIntegrationService.initCheckoutEventsSubscription(
            gatewayId,
            methodId,
            stripeocs,
            this.stripeElements,
        );
    }

    async execute(orderRequest: OrderRequestBody, options?: PaymentRequestOptions): Promise<void> {
        const { payment, ...order } = orderRequest;
        const { methodId, gatewayId } = payment || {};

        if (!this.stripeUPEClient) {
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

        await this.stripeUPEIntegrationService.updateStripePaymentIntent(gatewayId, methodId);

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
        this.stripeUPEIntegrationService.deinitialize();
        this.stripeElements = undefined;
        this.stripeUPEClient = undefined;

        return Promise.resolve();
    }

    private async _initializeStripeElement(
        stripeupe: StripeOCSPaymentInitializeOptions,
        gatewayId: string,
        methodId: string,
    ) {
        const state = await this.paymentIntegrationService.loadPaymentMethod(gatewayId, {
            params: { method: methodId },
        });
        const paymentMethod = state.getPaymentMethodOrThrow(methodId);

        if (!isStripePaymentMethodLike(paymentMethod)) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const {
            clientToken,
            initializationData: { stripePublishableKey, stripeConnectedAccount, shopperLanguage },
        } = paymentMethod;

        if (!clientToken) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        this.stripeUPEClient = await this._loadStripeJs(
            stripePublishableKey,
            stripeConnectedAccount,
        );

        const {
            containerId,
            style,
            layout,
            render,
            paymentMethodSelect,
            handleClosePaymentMethod,
        } = stripeupe;

        this.stripeElements = await this.scriptLoader.getElements(this.stripeUPEClient, {
            clientSecret: clientToken,
            locale: formatLocale(shopperLanguage),
            appearance: this._getElementAppearance(style),
            fonts: this._getElementFonts(style),
        });

        const { getBillingAddress, getShippingAddress } = state;
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
            });

        this.stripeUPEIntegrationService.mountElement(stripeElement, containerId);

        stripeElement.on(StripeElementEvent.READY, () => {
            render();
        });

        stripeElement.on(StripeElementEvent.CHANGE, (event: StripeEventType) => {
            this._onStripeElementChange(event, gatewayId, methodId, paymentMethodSelect);
        });

        handleClosePaymentMethod?.(this._collapseStripeElement.bind(this));
    }

    private async _loadStripeJs(
        stripePublishableKey: string,
        stripeConnectedAccount: string,
    ): Promise<StripeClient> {
        if (this.stripeUPEClient) {
            return this.stripeUPEClient;
        }

        return this.scriptLoader.getStripeClient(stripePublishableKey, stripeConnectedAccount);
    }

    private _getElementAppearance(
        style?: StripeOCSPaymentInitializeOptions['style'],
    ): StripeAppearanceOptions | undefined {
        if (!style) {
            return;
        }

        const radioColor = '#ddd'; // TODO: get style from theme
        const radioFocusColor = '#4496f6'; // TODO: get style from theme
        const radioIconSize = this._getRadioIconSizes(style);

        return {
            variables: {
                ...this.stripeUPEIntegrationService.mapAppearanceVariables(style),
                fontFamily: style.fontFamily?.toString(),
            },
            rules: {
                '.Input': this.stripeUPEIntegrationService.mapInputAppearanceRules(style),
                '.AccordionItem': {
                    borderRadius: 0,
                    borderWidth: 0,
                    borderBottom: style.accordionBorderBottom,
                    boxShadow: 'none',
                    fontSize: style.accordionItemTitleFontSize,
                    fontWeight: style.accordionItemTitleFontWeight,
                    color: style.accordionHeaderColor,
                    padding: style.accordionHeaderPadding,
                },
                '.TabLabel': {
                    color: style.accordionHeaderColor,
                },
                '.AccordionItem--selected': {
                    color: style.accordionHeaderColor,
                },
                '.RadioIcon': {
                    width: radioIconSize.outerWidth,
                },
                '.RadioIconOuter': {
                    strokeWidth: radioIconSize.outerStrokeWidth,
                    stroke: radioColor,
                },
                '.RadioIconOuter--checked': {
                    stroke: radioFocusColor,
                },
                '.RadioIconInner': {
                    r: radioIconSize.innerRadius,
                    fill: radioFocusColor,
                },
            },
        };
    }

    private _getElementFonts(style?: StripeOCSPaymentInitializeOptions['style']) {
        if (!style?.fontsSrc || !Array.isArray(style?.fontsSrc)) {
            return;
        }

        return style.fontsSrc.map((cssSrc: string) => ({ cssSrc }));
    }

    private _getRadioIconSizes(style?: StripeOCSPaymentInitializeOptions['style']) {
        if (!style) {
            return {};
        }

        const {
            radioIconOuterWidth = 26,
            radioIconOuterStrokeWidth = 1,
            radioIconInnerWidth = 17,
        } = style;
        const percentageCoefficient = this.stripeSVGSizeCoefficient * 100;

        const outerWidth = this._parseRadioIconNumberSize(radioIconOuterWidth);
        const outerStrokeWidth = this._parseRadioIconNumberSize(radioIconOuterStrokeWidth);
        const innerWidth = this._parseRadioIconNumberSize(radioIconInnerWidth);

        const stripeEqualOuterWidth = (outerWidth / this.stripeSVGSizeCoefficient).toFixed(2);
        const stripeEqualOuterStrokeWidth = (
            (outerStrokeWidth / outerWidth) *
            percentageCoefficient
        ).toFixed(2);
        const stripeEqualInnerRadius = (
            ((innerWidth / outerWidth) * percentageCoefficient) /
            2
        ).toFixed(2);

        return {
            outerWidth: `${stripeEqualOuterWidth}px`,
            outerStrokeWidth: `${stripeEqualOuterStrokeWidth}px`,
            innerRadius: `${stripeEqualInnerRadius}px`,
        };
    }

    private _parseRadioIconNumberSize(size: StripeUPEAppearanceValues = 0): number {
        if (Array.isArray(size)) {
            size = parseInt(size[0], 10);
        }

        if (typeof size === 'string') {
            size = parseInt(size, 10);
        }

        return size;
    }

    private _collapseStripeElement() {
        const stripeElement = this.stripeElements?.getElement(StripeElementType.PAYMENT);

        stripeElement?.collapse();
    }

    private _getPaymentPayload(methodId: string, token: string): Payment {
        const cartId = this.paymentIntegrationService.getState().getCart()?.id || '';
        const formattedPayload = {
            cart_id: cartId,
            credit_card_token: { token },
            confirm: false,
            payment_method_id: this.selectedMethodId,
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
            !this.stripeUPEIntegrationService.isAdditionalActionError(error.body.errors)
        ) {
            throw error;
        }

        if (!this.stripeUPEClient || !this.stripeElements) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        const { data: additionalActionData } = error.body.additional_action_required;
        const { token } = additionalActionData;

        const { paymentIntent } = await this._confirmStripePaymentOrThrow(
            methodId,
            additionalActionData,
        );

        const paymentPayload = this._getPaymentPayload(methodId, paymentIntent?.id || token);

        try {
            return await this.paymentIntegrationService.submitPayment(paymentPayload);
        } catch (error) {
            this.stripeUPEIntegrationService.throwPaymentConfirmationProceedMessage();
        }
    }

    private async _confirmStripePaymentOrThrow(
        methodId: string,
        additionalActionData: StripeAdditionalActionRequired['data'],
    ): Promise<StripeResult | never> {
        const { token, redirect_url } = additionalActionData;
        const stripePaymentData = this.stripeUPEIntegrationService.mapStripePaymentData(
            this.stripeElements,
            redirect_url,
        );
        let stripeError: StripeError | undefined;

        try {
            const isPaymentCompleted = await this.stripeUPEIntegrationService.isPaymentCompleted(
                methodId,
                this.stripeUPEClient,
            );

            const confirmationResult = !isPaymentCompleted
                ? await this.stripeUPEClient?.confirmPayment(stripePaymentData)
                : await this.stripeUPEClient?.retrievePaymentIntent(token || '');

            stripeError = confirmationResult?.error;

            if (stripeError || !confirmationResult?.paymentIntent) {
                throw new PaymentMethodFailedError();
            }

            return confirmationResult;
        } catch (error: unknown) {
            return this.stripeUPEIntegrationService.throwStripeError(stripeError);
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
