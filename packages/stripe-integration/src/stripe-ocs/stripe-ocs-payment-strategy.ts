import { merge } from 'lodash';

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
    PaymentRequestOptions,
    PaymentStrategy,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    isStripePaymentEvent,
    isStripePaymentMethodLike,
    StripeAdditionalActionRequired,
    StripeClient,
    StripeElement,
    StripeElementEvent,
    StripeElements,
    StripeElementType,
    StripeEventType,
    StripeFormattedPaymentPayload,
    StripeInitializationData,
    StripeInstrumentSetupFutureUsage,
    StripeIntegrationService,
    StripePIPaymentMethodOptions,
    StripePIPaymentMethodSavingOptions,
    StripeResult,
    StripeScriptLoader,
    StripeStringConstants,
} from '@bigcommerce/checkout-sdk/stripe-utils';

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

        const { isStoreCreditApplied } = this.paymentIntegrationService
            .getState()
            .getCheckoutOrThrow();

        if (isStoreCreditApplied) {
            await this.paymentIntegrationService.applyStoreCredit(isStoreCreditApplied);
        }

        await this.stripeIntegrationService.updateStripePaymentIntent(gatewayId, methodId);

        await this.paymentIntegrationService.submitOrder(order, options);

        const { clientToken } = this.paymentIntegrationService
            .getState()
            .getPaymentMethodOrThrow(methodId, gatewayId);

        const paymentPayload = this._getPaymentPayload(methodId, clientToken || '');

        try {
            await this.paymentIntegrationService.submitPayment(paymentPayload);
        } catch (error) {
            await this._processAdditionalAction(error, methodId, gatewayId);
        }
    }

    finalize(): Promise<void> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(): Promise<void> {
        const paymentElement = this.stripeElements?.getElement(StripeElementType.PAYMENT);

        paymentElement?.unmount();
        paymentElement?.destroy();
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
            .getPaymentMethodOrThrow(methodId, gatewayId);

        if (!paymentMethod?.clientToken) {
            const state = await this.paymentIntegrationService.loadPaymentMethod(gatewayId, {
                params: { method: methodId },
            });

            paymentMethod = state.getPaymentMethodOrThrow(methodId, gatewayId);
        }

        if (!isStripePaymentMethodLike(paymentMethod)) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const { clientToken, initializationData } = paymentMethod;
        const { customerSessionToken, enableLink } = initializationData;

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
            togglePreloader,
        } = stripe;

        this.stripeElements = await this.scriptLoader.getElements(this.stripeClient, {
            clientSecret: clientToken,
            customerSessionClientSecret: customerSessionToken,
            appearance,
            fonts,
        });

        const { getBillingAddress, getShippingAddress } = this.paymentIntegrationService.getState();
        const billingAddress = getBillingAddress();
        const { postalCode } = getShippingAddress() || billingAddress || {};

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
                    link: enableLink ? StripeStringConstants.AUTO : StripeStringConstants.NEVER,
                },
                layout,
                savePaymentMethod: {
                    maxVisiblePaymentMethods: 20,
                },
                defaultValues: {
                    billingDetails: {
                        email: billingAddress?.email || '',
                    },
                },
            });

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
        const stripeJsVersion =
            this.stripeIntegrationService.getStripeJsVersion(initializationData);

        return this.scriptLoader.getStripeClient(
            initializationData,
            state.getCartLocale(),
            stripeJsVersion,
        );
    }

    private _collapseStripeElement() {
        const stripeElement = this.stripeElements?.getElement(StripeElementType.PAYMENT);

        stripeElement?.collapse();
    }

    private _getPaymentPayload(
        methodId: string,
        token: string,
        paymentMethodOptions?: StripePIPaymentMethodOptions,
    ): Payment<StripeFormattedPaymentPayload> {
        const cartId = this.paymentIntegrationService.getState().getCart()?.id || '';
        const { card, us_bank_account } = paymentMethodOptions || {};
        const shouldSaveInstrument =
            this._shouldSaveInstrument(card) || this._shouldSaveInstrument(us_bank_account);
        const tokenizedOptions = this._getTokenizedOptions(token, paymentMethodOptions);

        const formattedPayload = {
            cart_id: cartId,
            confirm: false,
            method: this.selectedMethodId,
            vault_payment_instrument: shouldSaveInstrument,
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
        gatewayId: string,
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

        const { paymentIntent, error: stripeError } = await this._confirmStripePaymentOrThrow(
            methodId,
            additionalActionData,
        );
        const {
            client_secret: paymentIntentClientSecret,
            payment_method_options: paymentMethodOptions,
        } = paymentIntent || {};

        const paymentPayload = this._getPaymentPayload(
            methodId,
            paymentIntentClientSecret || token,
            paymentMethodOptions,
        );

        if (stripeError || !paymentIntent) {
            const { initializationData } = this.paymentIntegrationService
                .getState()
                .getPaymentMethodOrThrow<StripeInitializationData>(methodId, gatewayId);
            const { sendSecondPaymentRequestOnStripeError } = initializationData || {};

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

                    await this.paymentIntegrationService.submitPayment(paymentPayloadWithError);
                } catch {
                    // INFO: additional action should be ignored for this update status request.
                    // will throw Stripe error message to the shopper.
                }
            }

            this.stripeIntegrationService.throwStripeError(stripeError);
        }

        try {
            return await this.paymentIntegrationService.submitPayment(paymentPayload);
        } catch (error) {
            this.stripeIntegrationService.throwPaymentConfirmationProceedMessage();
        }
    }

    private async _confirmStripePaymentOrThrow(
        methodId: string,
        additionalActionData: StripeAdditionalActionRequired['data'],
    ): Promise<StripeResult | never> {
        if (!this.stripeClient) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        const { token, redirect_url } = additionalActionData;
        const stripePaymentData = this.stripeIntegrationService.mapStripePaymentData(
            this.stripeElements,
            redirect_url,
        );

        const isPaymentCompleted = await this.stripeIntegrationService.isPaymentCompleted(
            methodId,
            this.stripeClient,
        );

        return !isPaymentCompleted
            ? this.stripeClient.confirmPayment(stripePaymentData)
            : this.stripeClient.retrievePaymentIntent(token || '');
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

    private _shouldSaveInstrument(paymentMethodOptions?: StripePIPaymentMethodSavingOptions) {
        const setupFutureUsage = paymentMethodOptions?.setup_future_usage;

        return (
            setupFutureUsage === StripeInstrumentSetupFutureUsage.ON_SESSION ||
            setupFutureUsage === StripeInstrumentSetupFutureUsage.OFF_SESSION
        );
    }

    private _getTokenizedOptions(
        token: string,
        paymentMethodOptions?: StripePIPaymentMethodOptions,
    ) {
        if (this._shouldSaveInstrument(paymentMethodOptions?.us_bank_account)) {
            return { tokenized_ach: { token } };
        }

        return { credit_card_token: { token } };
    }
}
