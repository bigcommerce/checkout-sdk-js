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
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationSelectors,
    PaymentIntegrationService,
    PaymentMethodCancelledError,
    PaymentMethodFailedError,
    PaymentRequestOptions,
    PaymentStrategy,
    RequestError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import formatLocale from './format-locale';
import { isStripeUPEPaymentMethodLike } from './is-stripe-upe-payment-method-like';
import {
    StripeElement,
    StripeElements,
    StripeElementType,
    StripeEventType,
    StripeStringConstants,
    StripeUPEAppearanceOptions,
    StripeUPEClient,
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

        await this._initializeStripeElement(stripeupe, gatewayId, methodId).catch((error) =>
            stripeupe.onError?.(error),
        );

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

        if (!payment?.paymentData) {
            throw new PaymentArgumentInvalidError(['payment.paymentData']);
        }

        if (!this.stripeUPEClient) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        if (!gatewayId || !methodId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "gatewayId" or "methodId" argument is not provided.',
            );
        }

        const state = this.paymentIntegrationService.getState();
        const { isStoreCreditApplied: useStoreCredit } = state.getCheckoutOrThrow();

        if (useStoreCredit) {
            await this.paymentIntegrationService.applyStoreCredit(useStoreCredit);
        }

        await this.paymentIntegrationService.loadPaymentMethod(gatewayId, {
            params: { method: methodId },
        });

        await this.paymentIntegrationService.submitOrder(order, options);

        const paymentMethod = state.getPaymentMethodOrThrow(methodId);
        const paymentPayload = this._getPaymentPayload(methodId, paymentMethod.clientToken || '');

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
            initializationData: { stripePublishableKey, stripeConnectedAccount, shopperLanguage },
        } = paymentMethod;

        if (!paymentMethod.clientToken) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        this.stripeUPEClient = await this._loadStripeJs(
            stripePublishableKey,
            stripeConnectedAccount,
        );

        const { containerId, style, render, paymentMethodSelect, handleClosePaymentMethod } =
            stripeupe;

        this.stripeElements = await this.scriptLoader.getElements(this.stripeUPEClient, {
            clientSecret: paymentMethod.clientToken,
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
            if (!event?.value || !('type' in event.value)) {
                return;
            }

            this.selectedMethodId = event.value.type;
            paymentMethodSelect?.(`${gatewayId}-${methodId}`);
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
                    // 26px / 0.88 = 29.54
                    width: '29.54px',
                },
                '.RadioIconOuter': {
                    // 1px / 26px * 0.88 = 0.034
                    strokeWidth: '3.4',
                    stroke: radioColor,
                },
                '.RadioIconOuter--checked': {
                    stroke: radioFocusColor,
                },
                '.RadioIconInner': {
                    // 17.16px / 26px * 0.88 = 0.58 / 2 = 29
                    r: '29',
                    fill: radioFocusColor,
                },
            },
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
    ): Promise<PaymentIntegrationSelectors | never> {
        if (
            !isRequestError(error) ||
            !this.stripeUPEIntegrationService.isAdditionalActionError(error.body.errors)
        ) {
            throw error;
        }

        if (!this.stripeUPEClient || !this.stripeElements) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        const {
            data: { token, redirect_url },
        } = error.body.additional_action_required;
        const stripePaymentData = this.stripeUPEIntegrationService.mapStripePaymentData(
            this.stripeElements,
            redirect_url,
        );
        const isPaymentCompleted = await this.stripeUPEIntegrationService.isPaymentCompleted(
            methodId,
            this.stripeUPEClient,
        );

        if (
            this.stripeUPEIntegrationService.isRedirectAction(
                error.body.additional_action_required,
            ) &&
            !isPaymentCompleted
        ) {
            const { paymentIntent, error: stripeError } = await this.stripeUPEClient.confirmPayment(
                stripePaymentData,
            );

            if (stripeError) {
                this.stripeUPEIntegrationService.throwDisplayableStripeError(stripeError);
                throw new PaymentMethodFailedError();
            }

            if (!paymentIntent) {
                throw new RequestError();
            }
        } else if (
            this.stripeUPEIntegrationService.isOnPageAdditionalAction(
                error.body.additional_action_required,
            )
        ) {
            let result;
            let isConfirmCatchError = false;

            try {
                result = !isPaymentCompleted
                    ? await this.stripeUPEClient.confirmPayment(stripePaymentData)
                    : await this.stripeUPEClient.retrievePaymentIntent(token);
            } catch (error) {
                try {
                    result = await this.stripeUPEClient.retrievePaymentIntent(token);
                } catch (error) {
                    isConfirmCatchError = true;
                }
            }

            if (result?.error) {
                this.stripeUPEIntegrationService.throwDisplayableStripeError(result.error);

                if (this.stripeUPEIntegrationService.isCancellationError(result.error)) {
                    throw new PaymentMethodCancelledError();
                }

                throw new PaymentMethodFailedError();
            }

            if (!result?.paymentIntent && !isConfirmCatchError) {
                throw new RequestError();
            }

            const paymentPayload = this._getPaymentPayload(
                methodId,
                isConfirmCatchError ? token : result?.paymentIntent?.id,
            );

            try {
                return await this.paymentIntegrationService.submitPayment(paymentPayload);
            } catch (error) {
                this.stripeUPEIntegrationService.throwPaymentConfirmationProceedMessage();
            }
        }

        throw error;
    }
}
