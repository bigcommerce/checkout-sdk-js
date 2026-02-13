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
    StripeClient,
    StripeElement,
    StripeElementEvent,
    StripeElementsCreateOptions,
    StripeEventType,
    StripeInitializationData,
    StripeInstrumentSetupFutureUsage,
    StripeIntegrationService,
    StripeJsVersion,
    StripePIPaymentMethodOptions,
    StripePIPaymentMethodSavingOptions,
    StripeResult,
    StripeScriptLoader,
    StripeStringConstants,
} from '@bigcommerce/checkout-sdk/stripe-utils';

import StripeOCSPaymentInitializeOptions, {
    WithStripeOCSPaymentInitializeOptions,
} from '../stripe-ocs/stripe-ocs-initialize-options';
import { StripeError } from '../stripev3/stripev3';
import { StripeCheckoutSessionConfirmationResult } from 'packages/stripe-utils/src/stripe';

export default class StripeCSPaymentStrategy implements PaymentStrategy {
    private stripeClient?: StripeClient;
    private stripeCheckoutSession?: StripeCheckoutInstance;
    private selectedMethodId?: string;

    constructor(
        private readonly paymentIntegrationService: PaymentIntegrationService,
        private readonly scriptLoader: StripeScriptLoader,
        private readonly stripeIntegrationService: StripeIntegrationService,
    ) {}

    async initialize(
        options: PaymentInitializeOptions & WithStripeOCSPaymentInitializeOptions,
    ): Promise<void> {
        console.log('*** initialize stripe cs payment strategy ***');
        const { stripeocs, methodId, gatewayId } = options;

        if (!stripeocs?.containerId || !gatewayId) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        try {
            await this._initializeStripeElement(stripeocs, gatewayId, methodId);
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
        const paymentElement = this.stripeCheckoutSession?.getPaymentElement();

        paymentElement?.unmount();
        paymentElement?.destroy();
        this.stripeIntegrationService.deinitialize();
        this.stripeCheckoutSession = undefined;
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

        this.stripeCheckoutSession = await this.scriptLoader.getStripeCheckout(this.stripeClient, {
            clientSecret: clientToken,
            elementsOptions: {
                appearance,
                fonts,
            },
            adaptivePricing: {
                allowed: false,
            },
            defaultValues: {
                email: billingAddress?.email || '',
            },
        });

        const stripeElement = this._createStripeElement({
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

    private _createStripeElement(options?: StripeElementsCreateOptions): StripeElement | undefined {
        return (
            this.stripeCheckoutSession?.getPaymentElement() ||
            this.stripeCheckoutSession?.createPaymentElement(options)
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
        const stripeElement = this.stripeCheckoutSession?.getPaymentElement();

        stripeElement?.collapse();
    }

    async _updateCheckoutSessionData(gatewayId: string, methodId: string): Promise<void> {
        // INFO: to trigger checkout session data update on the BE side we need to make stripe config request
        await this.paymentIntegrationService.loadPaymentMethod(gatewayId, {
            params: { method: methodId },
        });
    }

    private _getPaymentPayload(
        methodId: string,
        token: string,
        paymentMethodOptions?: StripePIPaymentMethodOptions,
    ): Payment {
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

    private _getTokenizedOptions(
        token: string,
        paymentMethodOptions?: StripePIPaymentMethodOptions,
    ) {
        if (this._shouldSaveInstrument(paymentMethodOptions?.us_bank_account)) {
            return { tokenized_ach: { token } };
        }

        return { credit_card_token: { token } };
    }

    private _shouldSaveInstrument(paymentMethodOptions?: StripePIPaymentMethodSavingOptions) {
        const setupFutureUsage = paymentMethodOptions?.setup_future_usage;

        return (
            setupFutureUsage === StripeInstrumentSetupFutureUsage.ON_SESSION ||
            setupFutureUsage === StripeInstrumentSetupFutureUsage.OFF_SESSION
        );
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

        const { paymentIntent } = await this._confirmStripePaymentOrThrow(
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
        console.log(methodId, additionalActionData);
        const { /* token, */ redirect_url } = additionalActionData || {};
        // const stripePaymentData = this.stripeIntegrationService.mapStripePaymentData(
        //     this.stripeElements,
        //     redirect_url,
        // );
        let stripeError: StripeError | undefined;
        let confirmationResult: StripeCheckoutSessionConfirmationResult | undefined;

        try {

            if (!this.stripeClient || !this.stripeCheckoutSession) {
                throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
            }

            try {
                // const { total } = await this.stripeElements?.session();
                // console.log('*** total', total.total.amount);
                const { actions: stripeActions, error: stripeActionsError } = await this.stripeCheckoutSession.loadActions();

                if (stripeActionsError || !stripeActions) {
                    throw new PaymentMethodFailedError(stripeActionsError?.message);
                }

                confirmationResult = await stripeActions.confirm({
                    redirect: StripeStringConstants.IF_REQUIRED,
                });
            } catch (error) {
                console.log('*** confirm payment error', error);
                throw error;
            }

            console.log('*** confirmationResult', confirmationResult);

            stripeError = confirmationResult?.error;

            // if (stripeError || !confirmationResult?.paymentIntent) {
            //     throw new PaymentMethodFailedError();
            // }

            if (stripeError || !confirmationResult) {
                console.log('*** stripe confirmation error', confirmationResult);
                throw new PaymentMethodFailedError();
            }

            return confirmationResult;
        } catch (error: unknown) {
            return this.stripeIntegrationService.throwStripeError(stripeError);
        }
    }
}
