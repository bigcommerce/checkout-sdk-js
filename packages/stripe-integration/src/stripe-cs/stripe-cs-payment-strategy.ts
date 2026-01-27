import {
    InvalidArgumentError,
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
    StripeCheckoutElements,
    StripeCheckoutSessionClient,
    StripeElementEvent,
    StripeError,
    StripeEventType,
    StripeInitializationData,
    StripeInstrumentSetupFutureUsage,
    StripeIntegrationService,
    StripePIPaymentMethodOptions,
    StripePIPaymentMethodSavingOptions,
    StripeResult,
    StripeStringConstants,
} from '@bigcommerce/checkout-sdk/stripe-utils';

import StripeOCSPaymentInitializeOptions, { WithStripeOCSPaymentInitializeOptions } from '../stripe-ocs/stripe-ocs-initialize-options';
import StripeCSScriptLoader from './stripe-cs-script-loader';

export default class StripeCSPaymentStrategy implements PaymentStrategy {
    private stripeClient?: StripeCheckoutSessionClient;
    private stripeElements?: StripeCheckoutElements;
    private selectedMethodId?: string;
    private readonly clientTokenMock: string = 'cs_test_b1MLGOneOQSxxfTNAiYdbQ7GLknR9ssbkKierRvQdpS7KkYXjqCbwsf1Qu_secret_fidnandhYHdWcXxpYCc%2FJ2FgY2RwaXEnKSdwbEhqYWAnPydmcHZxamgneCUl';

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private scriptLoader: StripeCSScriptLoader,
        private stripeIntegrationService: StripeIntegrationService,
    ) {}

    async initialize(
        options: PaymentInitializeOptions & WithStripeOCSPaymentInitializeOptions,
    ): Promise<void> {
        const { stripeocs, methodId, gatewayId } = options;

        console.log('*** init Stripe CS');

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

        // this.stripeIntegrationService.initCheckoutEventsSubscription(
        //     gatewayId,
        //     methodId,
        //     stripeocs,
        //     this.stripeElements,
        // );
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

        // const { clientToken } = state.getPaymentMethodOrThrow(methodId);
        const { clientToken } = this.getPaymentMethodOrThrowMock(methodId);
        // const paymentPayload = this._getPaymentPayload(methodId, clientToken || '');
        const paymentPayload = this._getPaymentPayload(methodId, clientToken || '');

        try {
            console.log('*** before submit payment');
            await this.paymentIntegrationService.submitPayment(paymentPayload);
        } catch (error) {
            console.log('*** error', error);
            console.log('*** before process additional action');
            await this._processAdditionalAction(error, methodId);
        }
    }

    finalize(): Promise<void> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(): Promise<void> {
        const paymentElement = this.stripeElements?.getPaymentElement();

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
        // let paymentMethod = this.paymentIntegrationService.getState().getPaymentMethodOrThrow(methodId);
        let paymentMethod = this.getPaymentMethodOrThrowMock(methodId);

        if (!paymentMethod?.clientToken) {
            await this.paymentIntegrationService.loadPaymentMethod(gatewayId, {
                params: { method: methodId },
            });

            // paymentMethod = this.paymentIntegrationService.getState().getPaymentMethodOrThrow(methodId);
            paymentMethod = this.getPaymentMethodOrThrowMock(methodId);
        }

        if (!isStripePaymentMethodLike(paymentMethod)) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const { clientToken, initializationData } = paymentMethod;
        // const {  shopperLanguage, customerSessionToken, enableLink } = initializationData;

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


        console.log('*** clientToken', clientToken);

        this.stripeElements = await this.scriptLoader.getElements(this.stripeClient, {
            // clientSecret: clientToken,
            fetchClientSecret: async () => clientToken,
            // customerSessionClientSecret: customerSessionToken,
            // locale: formatStripeLocale(shopperLanguage),
            elementsOptions: {
                appearance,
                fonts,
            },
            adaptivePricing: {
                allowed: false,
            },
        });

        const { getBillingAddress, getShippingAddress } = this.paymentIntegrationService.getState();
        const billingAddress = getBillingAddress();
        const { postalCode } = getShippingAddress() || billingAddress || {};
        console.log(postalCode);

        // const stripeEmailUpdateResult = await this.stripeElements.updateEmail(billingAddress?.email || '');
        // console.log('*** stripeEmailUpdateResult', stripeEmailUpdateResult);

        const stripeCheckoutSessionData = this.stripeElements.session();
        console.log('*** stripeCheckoutSessionData', stripeCheckoutSessionData);

        const stripeElement =
            this.stripeElements.getPaymentElement() ||
            this.stripeElements.createPaymentElement({
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
                // wallets: {
                //     applePay: StripeStringConstants.NEVER,
                //     googlePay: StripeStringConstants.NEVER,
                //     link: enableLink ? StripeStringConstants.AUTO : StripeStringConstants.NEVER,
                // },
                layout,
                // savePaymentMethod: {
                //     maxVisiblePaymentMethods: 20,
                // },
                // defaultValues: {
                //     billingDetails: {
                //         email: billingAddress?.email || '',
                //     },
                // },
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
    ): Promise<StripeCheckoutSessionClient> {
        if (this.stripeClient) {
            return this.stripeClient;
        }

        const state = this.paymentIntegrationService.getState();

        console.log('*** getStripeClient 1');

        return this.scriptLoader.getStripeClient(
            initializationData,
            state.getCartLocale(),
            [
                'custom_checkout_adaptive_pricing_2',
                // 'custom_checkout_beta_6',
            ],
        );
    }

    private _collapseStripeElement() {
        const stripeElement = this.stripeElements?.getPaymentElement();

        stripeElement?.collapse();
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

    private async _processAdditionalAction(
        error: unknown,
        methodId: string,
    ): Promise<PaymentIntegrationSelectors | undefined> {
        // if (
        //     !isRequestError(error) ||
        //     !this.stripeIntegrationService.isAdditionalActionError(error.body.errors)
        // ) {
        //     throw error;
        // }

        console.log('*** additional action error', error);

        if (!this.stripeClient || !this.stripeElements) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        const { data: additionalActionData } = (error as any).body?.additional_action_required || {};
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
        // const { /* token, */ redirect_url } = additionalActionData || {};
        // const stripePaymentData = this.stripeIntegrationService.mapStripePaymentData(
        //     this.stripeElements,
        //     redirect_url,
        // );
        let stripeError: StripeError | undefined;

        try {
            // const isPaymentCompleted = await this.stripeIntegrationService.isPaymentCompleted(
            //     methodId,
            //     this.stripeClient,
            // );

            // const confirmationResult = !isPaymentCompleted
            //     ? await this.stripeClient?.confirmPayment(stripePaymentData)
            //     : await this.stripeClient?.retrievePaymentIntent(token || '');

            console.log('*** confirm payment');

            let confirmationResult;

            try {
                const { total } = await this.stripeElements?.session();
                console.log('*** total', total.total.amount);
                confirmationResult = await this.stripeElements?.confirm({
                    shippingAddress: {
                        name: 'John Doe',
                        address: {
                            line1: '123 Main St',
                            city: 'Anytown',
                            state: 'CA',
                            postal_code: '12345',
                            country: 'US',
                        },
                    }
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

    private getPaymentMethodOrThrowMock(methodId: string) {
        const state = this.paymentIntegrationService.getState();
        const paymentMethod = state.getPaymentMethodOrThrow(methodId);
        if (!!paymentMethod) {
            // paymentMethod.clientToken = this.clientTokenMock;
        }

        console.log('*** paymentMethod mocked', paymentMethod, this.clientTokenMock);

        return paymentMethod;
    }
}
