import { some } from 'lodash';

import {
    FormattedHostedInstrument,
    InvalidArgumentError,
    isHostedInstrumentLike,
    isRequestError,
    isVaultedInstrument,
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
    PaymentMethodFailedError,
    PaymentRequestOptions,
    PaymentStrategy,
    RequestError,
    StripeUPEIntent,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    formatStripeLocale,
    isStripePaymentMethodLike,
    STRIPE_UPE_CLIENT_API_VERSION,
    STRIPE_UPE_CLIENT_BETAS,
    StripeAdditionalActionRequired,
    StripeAppearanceOptions,
    StripeClient,
    StripeElement,
    StripeElementEvent,
    StripeElements,
    StripeElementsCreateOptions,
    StripeElementType,
    StripeElementUpdateOptions,
    StripeError,
    StripeEventType,
    StripeInitializationData,
    StripeIntegrationService,
    StripePaymentMethodType,
    StripeResult,
    StripeScriptLoader,
    StripeStringConstants,
} from '@bigcommerce/checkout-sdk/stripe-utils';

import isStripeAcceleratedCheckoutCustomer from './is-stripe-accelerated-checkout-customer';
import StripeUPEPaymentInitializeOptions, {
    WithStripeUPEPaymentInitializeOptions,
} from './stripe-upe-initialize-options';

export default class StripeUPEPaymentStrategy implements PaymentStrategy {
    private _stripeUPEClient?: StripeClient;
    private _stripeElements?: StripeElements;
    private _isStripeElementUpdateEnabled?: boolean;
    private _allowRedisplayForStoredInstruments?: boolean;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private scriptLoader: StripeScriptLoader,
        private stripeIntegrationService: StripeIntegrationService,
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

        this._loadStripeElement(stripeupe, gatewayId, methodId).catch((error) =>
            stripeupe.onError?.(error),
        );

        this.stripeIntegrationService.initCheckoutEventsSubscription(
            gatewayId,
            methodId,
            stripeupe,
            this._stripeElements,
        );

        return Promise.resolve();
    }

    async execute(orderRequest: OrderRequestBody, options?: PaymentRequestOptions): Promise<void> {
        const { payment, ...order } = orderRequest;

        if (!payment || !payment.paymentData) {
            throw new PaymentArgumentInvalidError(['payment.paymentData']);
        }

        if (!this._stripeUPEClient) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        const { paymentData, methodId, gatewayId } = payment;
        const { shouldSaveInstrument = false, shouldSetAsDefaultInstrument = false } =
            isHostedInstrumentLike(paymentData) ? paymentData : {};
        const state = this.paymentIntegrationService.getState();
        const { isStoreCreditApplied: useStoreCredit } = state.getCheckoutOrThrow();
        const paymentProviderCustomer = state.getPaymentProviderCustomerOrThrow();
        const stripePaymentProviderCustomer = isStripeAcceleratedCheckoutCustomer(
            paymentProviderCustomer,
        )
            ? paymentProviderCustomer
            : {};
        const stripeLinkAuthenticationState =
            stripePaymentProviderCustomer.stripeLinkAuthenticationState;

        if (useStoreCredit) {
            await this.paymentIntegrationService.applyStoreCredit(useStoreCredit);
        }

        if (gatewayId) {
            await this.stripeIntegrationService.updateStripePaymentIntent(gatewayId, methodId);

            const { email } = state.getCustomerOrThrow();

            if (stripeLinkAuthenticationState !== undefined && !email) {
                const billingAddress = state.getBillingAddressOrThrow();

                await this.paymentIntegrationService.updateBillingAddress(billingAddress);
            }
        }

        await this.paymentIntegrationService.submitOrder(order, options);

        if (isVaultedInstrument(paymentData)) {
            const { instrumentId } = paymentData;

            await this._executeWithVaulted(
                payment.methodId,
                instrumentId,
                shouldSetAsDefaultInstrument,
            );

            return;
        }

        await this._executeWithStripeConfirmation(
            payment.methodId,
            stripeLinkAuthenticationState ? false : shouldSaveInstrument,
            shouldSetAsDefaultInstrument,
        );
    }

    finalize(): Promise<void> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(): Promise<void> {
        this._stripeElements?.getElement(StripeElementType.PAYMENT)?.unmount();
        this.stripeIntegrationService.deinitialize();
        this._stripeElements = undefined;
        this._stripeUPEClient = undefined;

        return Promise.resolve();
    }

    private async _executeWithStripeConfirmation(
        methodId: string,
        shouldSaveInstrument?: boolean,
        shouldSetAsDefaultInstrument?: boolean,
    ): Promise<void> {
        const state = this.paymentIntegrationService.getState();
        const { clientToken } = state.getPaymentMethodOrThrow(methodId);
        const paymentPayload = this._getPaymentPayload(
            methodId,
            clientToken || '',
            shouldSaveInstrument,
            shouldSetAsDefaultInstrument,
        );

        try {
            await this.paymentIntegrationService.submitPayment(paymentPayload);
        } catch (error) {
            await this._processAdditionalActionWithStripeConfirmation(
                error,
                methodId,
                shouldSaveInstrument,
                shouldSetAsDefaultInstrument,
            );
        }
    }

    private async _executeWithVaulted(
        methodId: string,
        token: string,
        shouldSetAsDefaultInstrument: boolean,
    ): Promise<PaymentIntegrationSelectors | void> {
        const state = this.paymentIntegrationService.getState();
        const paymentMethod = state.getPaymentMethodOrThrow(methodId);
        const cartId = state.getCart()?.id;

        try {
            const paymentPayload = {
                methodId,
                paymentData: {
                    formattedPayload: {
                        cart_id: cartId,
                        bigpay_token: { token },
                        confirm: false,
                        client_token: paymentMethod.clientToken,
                        set_as_default_stored_instrument: shouldSetAsDefaultInstrument,
                    },
                },
            };

            return await this.paymentIntegrationService.submitPayment(paymentPayload);
        } catch (error) {
            return this._processVaultedAdditionalAction(
                error,
                methodId,
                shouldSetAsDefaultInstrument,
            );
        }
    }

    private async _loadStripeElement(
        stripeupe: StripeUPEPaymentInitializeOptions,
        gatewayId: string,
        methodId: string,
    ) {
        const { containerId, style, render, initStripeElementUpdateTrigger } = stripeupe;
        const state = await this.paymentIntegrationService.loadPaymentMethod(gatewayId, {
            params: { method: methodId },
        });
        const paymentMethod = state.getPaymentMethodOrThrow(methodId);
        const { checkoutSettings } = state.getStoreConfigOrThrow();

        if (!isStripePaymentMethodLike(paymentMethod)) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const { clientToken, initializationData } = paymentMethod;
        const {
            shopperLanguage,
            allowRedisplayForStoredInstruments = false,
            enableLink,
        } = initializationData;

        this._allowRedisplayForStoredInstruments = allowRedisplayForStoredInstruments;

        if (!clientToken) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        this._stripeUPEClient = await this._loadStripeJs(initializationData);
        this._isStripeElementUpdateEnabled =
            !!checkoutSettings.features['PI-1679.trigger_update_stripe_payment_element'] &&
            typeof initStripeElementUpdateTrigger === 'function';

        let appearance: StripeAppearanceOptions | undefined;

        if (style) {
            const styles = style;

            appearance = {
                variables: this.stripeIntegrationService.mapAppearanceVariables(style),
                rules: {
                    '.Input': this.stripeIntegrationService.mapInputAppearanceRules(styles),
                },
            };
        }

        this._stripeElements = await this.scriptLoader.getElements(this._stripeUPEClient, {
            clientSecret: clientToken,
            locale: formatStripeLocale(shopperLanguage),
            appearance,
        });

        const { getBillingAddress, getShippingAddress } = state;
        const { postalCode } = getShippingAddress() || getBillingAddress() || {};

        const stripeElement: StripeElement =
            this._stripeElements.getElement(StripeElementType.PAYMENT) ||
            this._stripeElements.create(StripeElementType.PAYMENT, {
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
                ...this._getStripeElementTerms(),
            });

        this.stripeIntegrationService.mountElement(stripeElement, containerId);

        stripeElement.on(StripeElementEvent.READY, () => {
            render();
        });

        stripeElement.on(StripeElementEvent.CHANGE, (event: StripeEventType) => {
            if (!event?.value || !('type' in event.value)) {
                return;
            }

            this._updateStripeLinkStateByElementType(event.value.type);
        });

        if (this._isStripeElementUpdateEnabled) {
            initStripeElementUpdateTrigger?.(this._updateStripeElement.bind(this));
        }
    }

    private async _processAdditionalActionWithStripeConfirmation(
        error: unknown,
        methodId: string,
        shouldSaveInstrument = false,
        shouldSetAsDefaultInstrument = false,
    ): Promise<void> {
        if (
            !isRequestError(error) ||
            !this.stripeIntegrationService.isAdditionalActionError(error.body.errors)
        ) {
            throw error;
        }

        if (!this._stripeUPEClient || !this._stripeElements) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        const { data: additionalActionData } = error.body.additional_action_required;
        const { token } = additionalActionData;

        const { paymentIntent } = await this._confirmStripePaymentOrThrow(
            methodId,
            additionalActionData,
        );

        const paymentPayload = this._getPaymentPayload(
            methodId,
            paymentIntent?.id || token,
            shouldSaveInstrument,
            shouldSetAsDefaultInstrument,
        );

        try {
            await this.paymentIntegrationService.submitPayment(paymentPayload);
        } catch (error) {
            this.stripeIntegrationService.throwPaymentConfirmationProceedMessage();
        }
    }

    private async _confirmStripePaymentOrThrow(
        methodId: string,
        additionalActionData: StripeAdditionalActionRequired['data'],
    ): Promise<StripeResult | never> {
        const { token, redirect_url } = additionalActionData;
        const stripePaymentData = this.stripeIntegrationService.mapStripePaymentData(
            this._stripeElements,
            redirect_url,
            !!this._allowRedisplayForStoredInstruments,
        );
        let stripeError: StripeError | undefined;

        try {
            const isPaymentCompleted = await this.stripeIntegrationService.isPaymentCompleted(
                methodId,
                this._stripeUPEClient,
            );

            const confirmationResult = !isPaymentCompleted
                ? await this._stripeUPEClient?.confirmPayment(stripePaymentData)
                : await this._stripeUPEClient?.retrievePaymentIntent(token || '');

            stripeError = confirmationResult?.error;

            if (stripeError || !confirmationResult?.paymentIntent) {
                throw new PaymentMethodFailedError();
            }

            return confirmationResult;
        } catch (error: unknown) {
            this.stripeIntegrationService.throwStripeError(stripeError);
        }
    }

    private async _processVaultedAdditionalAction(
        error: unknown,
        methodId?: string,
        shouldSetAsDefaultInstrument = false,
    ): Promise<PaymentIntegrationSelectors | never> {
        if (
            !methodId ||
            !isRequestError(error) ||
            !some(error.body.errors, { code: 'three_d_secure_required' })
        ) {
            throw error;
        }

        if (!this._stripeUPEClient || !this._stripeElements) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        const clientSecret = error.body.three_ds_result.token;
        let result;
        let catchedConfirmError = false;

        try {
            result = await this._stripeUPEClient.confirmCardPayment(clientSecret);
        } catch (error) {
            try {
                result = await this._stripeUPEClient.retrievePaymentIntent(clientSecret);
            } catch (error) {
                catchedConfirmError = true;
            }
        }

        if (result?.error) {
            this.stripeIntegrationService.throwStripeError(result.error);
        }

        if (!result?.paymentIntent && !catchedConfirmError) {
            throw new RequestError();
        }

        const paymentPayload = this._getPaymentPayload(
            methodId,
            catchedConfirmError ? clientSecret : result?.paymentIntent?.id,
            false,
            shouldSetAsDefaultInstrument,
        );

        return this.paymentIntegrationService.submitPayment(paymentPayload);
    }

    private async _loadStripeJs(
        initializationData: StripeInitializationData,
    ): Promise<StripeClient> {
        if (this._stripeUPEClient) {
            return this._stripeUPEClient;
        }

        return this.scriptLoader.getStripeClient(
            initializationData,
            STRIPE_UPE_CLIENT_BETAS,
            STRIPE_UPE_CLIENT_API_VERSION,
        );
    }

    private _getPaymentPayload(
        methodId: string,
        token: string,
        shouldSaveInstrument = false,
        shouldSetAsDefaultInstrument = false,
    ): Payment {
        const cartId = this.paymentIntegrationService.getState().getCart()?.id || '';
        const formattedPayload: StripeUPEIntent & FormattedHostedInstrument = {
            cart_id: cartId,
            credit_card_token: { token },
            confirm: false,
            vault_payment_instrument: shouldSaveInstrument,
            set_as_default_stored_instrument: shouldSetAsDefaultInstrument,
        };

        return {
            methodId,
            paymentData: {
                formattedPayload,
            },
        };
    }

    private _updateStripeElement({ shouldShowTerms }: StripeElementUpdateOptions): void {
        const stripeElement = this._stripeElements?.getElement(StripeElementType.PAYMENT);

        stripeElement?.update({
            ...this._getStripeElementTerms(shouldShowTerms),
        });
    }

    private _getStripeElementTerms(
        shouldShowTerms?: boolean,
    ): Pick<StripeElementsCreateOptions, 'terms'> {
        let card = StripeStringConstants.AUTO;

        if (this._isStripeElementUpdateEnabled) {
            card = shouldShowTerms ? StripeStringConstants.AUTO : StripeStringConstants.NEVER;
        }

        return {
            terms: {
                card,
            },
        };
    }

    private _updateStripeLinkStateByElementType(paymentElementType: StripePaymentMethodType): void {
        const state = this.paymentIntegrationService.getState();
        const paymentProviderCustomer = state.getPaymentProviderCustomerOrThrow();
        const isStripeLinkElementType = paymentElementType === StripePaymentMethodType.Link;

        // INFO: Trigger additional update only if Stripe Link Authentication was skipped on the customer step, but the Link payment element was rendered.
        if (
            !isStripeAcceleratedCheckoutCustomer(paymentProviderCustomer) &&
            isStripeLinkElementType
        ) {
            this.paymentIntegrationService.updatePaymentProviderCustomer({
                stripeLinkAuthenticationState: isStripeLinkElementType,
            });
        }
    }
}
