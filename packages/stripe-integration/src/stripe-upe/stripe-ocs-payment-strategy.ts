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
    PaymentMethodCancelledError,
    PaymentMethodFailedError,
    PaymentRequestOptions,
    PaymentStrategy,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import formatLocale from './format-locale';
import { isStripeError } from './is-stripe-error';
import { isStripePaymentEvent } from './is-stripe-payment-event';
import { isStripeUPEPaymentMethodLike } from './is-stripe-upe-payment-method-like';
import {
    StripeAdditionalActionRequired,
    StripeElement,
    StripeElements,
    StripeElementType,
    StripeError,
    StripeEventType,
    StripeStringConstants,
    StripeUPEAppearanceOptions,
    StripeUPEClient,
    StripeUpeResult,
} from './stripe-upe';
import StripeUPEPaymentInitializeOptions, {
    WithStripeUPEPaymentInitializeOptions,
} from './stripe-upe-initialize-options';
import StripeUPEIntegrationService from './stripe-upe-integration-service';
import StripeUPEScriptLoader from './stripe-upe-script-loader';

export default class StripeOCSPaymentStrategy implements PaymentStrategy {
    private stripeUPEClient?: StripeUPEClient;
    private stripeElements?: StripeElements;
    private selectedMethodId?: string;
    private readonly stripeSVGSizeCoefficient = 0.88;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private scriptLoader: StripeUPEScriptLoader,
        private stripeUPEIntegrationService: StripeUPEIntegrationService,
    ) {}

    async initialize(
        options: PaymentInitializeOptions & WithStripeUPEPaymentInitializeOptions,
    ): Promise<void> {
        const { stripeupe, methodId, gatewayId } = options;

        if (!stripeupe?.containerId) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        if (!gatewayId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "gatewayId" argument is not provided.',
            );
        }

        try {
            await this._initializeStripeElement(stripeupe, gatewayId, methodId);
        } catch (error) {
            if (error instanceof Error) {
                stripeupe.onError?.(error);
            }
        }

        this.stripeUPEIntegrationService.initCheckoutEventsSubscription(
            gatewayId,
            methodId,
            stripeupe,
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
        stripeupe: StripeUPEPaymentInitializeOptions,
        gatewayId: string,
        methodId: string,
    ) {
        const state = await this.paymentIntegrationService.loadPaymentMethod(gatewayId, {
            params: { method: methodId },
        });
        const paymentMethod = state.getPaymentMethodOrThrow(methodId);

        if (!isStripeUPEPaymentMethodLike(paymentMethod)) {
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

        const { containerId, style, render, paymentMethodSelect, handleClosePaymentMethod } =
            stripeupe;

        this.stripeElements = await this.scriptLoader.getElements(this.stripeUPEClient, {
            clientSecret: clientToken,
            locale: formatLocale(shopperLanguage),
            appearance: this._getElementAppearance(style),
            fonts: [
                {
                    cssSrc: 'https://fonts.googleapis.com/css?family=Montserrat:700,500,400%7CKarla:400&display=swap', // TODO: get style from theme
                },
            ],
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
                layout: {
                    type: 'accordion',
                    defaultCollapsed: false,
                    radios: true,
                    spacedAccordionItems: false,
                    visibleAccordionItemsCount: 0,
                },
            });

        this.stripeUPEIntegrationService.mountElement(stripeElement, containerId);

        stripeElement.on('ready', () => {
            render();
        });

        stripeElement.on('change', (event: StripeEventType) => {
            this._onStripeElementChange(event, gatewayId, methodId, paymentMethodSelect);
        });

        handleClosePaymentMethod?.(this._collapseStripeElement.bind(this));
    }

    private async _loadStripeJs(
        stripePublishableKey: string,
        stripeConnectedAccount: string,
    ): Promise<StripeUPEClient> {
        if (this.stripeUPEClient) {
            return this.stripeUPEClient;
        }

        return this.scriptLoader.getStripeClient(stripePublishableKey, stripeConnectedAccount);
    }

    private _getElementAppearance(
        style?: StripeUPEPaymentInitializeOptions['style'],
    ): StripeUPEAppearanceOptions | undefined {
        if (!style) {
            return;
        }

        const titleFontSize = '15px'; // TODO: get style from theme
        const titleFontWeight = '700'; // TODO: get style from theme
        const titleColor = '#5f5f5f'; // TODO: get style from theme
        const radioColor = '#ddd'; // TODO: get style from theme
        const radioFocusColor = '#4496f6'; // TODO: get style from theme
        const { radioIconOuterWidth, radioIconOuterStrokeWidth, radioIconInnerWidth } = style;
        const radioIconSize = this._getRadioIconSizes(
            radioIconOuterWidth,
            radioIconOuterStrokeWidth,
            radioIconInnerWidth,
        );

        return {
            variables: {
                ...this.stripeUPEIntegrationService.mapAppearanceVariables(style),
                fontFamily: 'Montserrat, Arial, Helvetica', // TODO: get style from theme
            },
            rules: {
                '.Input': this.stripeUPEIntegrationService.mapInputAppearanceRules(style),
                '.AccordionItem': {
                    borderRadius: 0,
                    borderWidth: 0,
                    borderBottomWidth: '1px',
                    boxShadow: 'none',
                    fontSize: titleFontSize,
                    fontWeight: titleFontWeight,
                    padding: '13px 20px 13px 18px',
                },
                '.TabLabel, .AccordionItem': {
                    fontSize: titleFontSize,
                    fontWeight: titleFontWeight,
                    color: titleColor,
                },
                '.TabLabel--selected, .AccordionItem--selected': {
                    fontWeight: titleFontWeight,
                    color: titleColor,
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

    private _getRadioIconSizes(
        realOuterWidth: string | number = 26,
        realOuterStrokeWidth: string | number = 1,
        realInnerWidth: string | number = 17,
    ) {
        const percentageCoefficient = this.stripeSVGSizeCoefficient * 100;

        const outerWidth =
            typeof realOuterWidth === 'string' ? parseInt(realOuterWidth, 10) : realOuterWidth;
        const outerStrokeWidth =
            typeof realOuterStrokeWidth === 'string'
                ? parseInt(realOuterStrokeWidth, 10)
                : realOuterStrokeWidth;
        const innerWidth =
            typeof realInnerWidth === 'string' ? parseInt(realInnerWidth, 10) : realInnerWidth;

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
    ): Promise<StripeUpeResult | never> {
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
            this._throwStripeError(stripeError);
        }
    }

    private _throwStripeError(stripeError?: unknown): never {
        if (isStripeError(stripeError)) {
            this.stripeUPEIntegrationService.throwDisplayableStripeError(stripeError);

            if (this.stripeUPEIntegrationService.isCancellationError(stripeError)) {
                throw new PaymentMethodCancelledError();
            }
        }

        throw new PaymentMethodFailedError();
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
