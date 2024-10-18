import { includes, some } from 'lodash';

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
    PaymentMethodCancelledError,
    PaymentMethodFailedError,
    PaymentRequestOptions,
    PaymentStrategy,
    RequestError,
    StripeUPEIntent,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import formatLocale from './format-locale';
import isStripeAcceleratedCheckoutCustomer from './is-stripe-accelerated-checkout-customer';
import { isStripeUPEPaymentMethodLike } from './is-stripe-upe-payment-method-like';
import {
    StripeElement,
    StripeElements,
    StripeElementsCreateOptions,
    StripeElementType,
    StripeElementUpdateOptions,
    StripeEventType,
    StripePaymentMethodType,
    StripeStringConstants,
    StripeUPEAppearanceOptions,
    StripeUPEClient,
} from './stripe-upe';
import StripeUPEPaymentInitializeOptions, {
    WithStripeUPEPaymentInitializeOptions,
} from './stripe-upe-initialize-options';
import StripeUPEIntegrationService from './stripe-upe-integration-service';
import StripeUPEScriptLoader from './stripe-upe-script-loader';

const APM_REDIRECT = [
    StripePaymentMethodType.SOFORT,
    StripePaymentMethodType.EPS,
    StripePaymentMethodType.GRABPAY,
    StripePaymentMethodType.BANCONTACT,
    StripePaymentMethodType.IDEAL,
    StripePaymentMethodType.GIROPAY,
    StripePaymentMethodType.ALIPAY,
    StripePaymentMethodType.KLARNA,
];

export default class StripeUPEPaymentStrategy implements PaymentStrategy {
    private _stripeUPEClient?: StripeUPEClient;
    private _stripeElements?: StripeElements;
    private _isStripeElementUpdateEnabled?: boolean;

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

        this._loadStripeElement(stripeupe, gatewayId, methodId).catch((error) =>
            stripeupe.onError?.(error),
        );

        this.stripeUPEIntegrationService.initCheckoutEventsSubscription(
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

        if (useStoreCredit) {
            await this.paymentIntegrationService.applyStoreCredit(useStoreCredit);
        }

        if (gatewayId) {
            await this.paymentIntegrationService.loadPaymentMethod(gatewayId, {
                params: { method: methodId },
            });

            const { email } = state.getCustomerOrThrow();

            const paymentProviderCustomer = state.getPaymentProviderCustomerOrThrow();
            const stripePaymentProviderCustomer = isStripeAcceleratedCheckoutCustomer(
                paymentProviderCustomer,
            )
                ? paymentProviderCustomer
                : {};
            const stripeLinkAuthenticationState =
                stripePaymentProviderCustomer.stripeLinkAuthenticationState;

            if (stripeLinkAuthenticationState !== undefined && !email) {
                const billingAddress = state.getBillingAddressOrThrow();

                await this.paymentIntegrationService.updateBillingAddress(billingAddress);
            }
        }

        if (isVaultedInstrument(paymentData)) {
            await this.paymentIntegrationService.submitOrder(order, options);

            const { instrumentId } = paymentData;

            await this._executeWithVaulted(
                payment.methodId,
                instrumentId,
                shouldSetAsDefaultInstrument,
            );

            return;
        }

        if (includes(APM_REDIRECT, methodId)) {
            await this.paymentIntegrationService.submitOrder(order, options);

            await this._executeWithAPM(payment.methodId);

            return;
        }

        await this.paymentIntegrationService.submitOrder(order, options);

        await this._executeWithoutRedirect(
            payment.methodId,
            shouldSaveInstrument,
            shouldSetAsDefaultInstrument,
        );
    }

    finalize(): Promise<void> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(): Promise<void> {
        this._stripeElements?.getElement(StripeElementType.PAYMENT)?.unmount();
        this.stripeUPEIntegrationService.deinitialize();

        return Promise.resolve();
    }

    private async _executeWithAPM(methodId: string): Promise<PaymentIntegrationSelectors> {
        const state = this.paymentIntegrationService.getState();
        const paymentMethod = state.getPaymentMethodOrThrow(methodId);
        const paymentPayload = this._getPaymentPayload(methodId, paymentMethod.clientToken || '');

        try {
            return await this.paymentIntegrationService.submitPayment(paymentPayload);
        } catch (error) {
            return this._processAdditionalAction(error, methodId);
        }
    }

    private async _executeWithoutRedirect(
        methodId: string,
        shouldSaveInstrument: boolean,
        shouldSetAsDefaultInstrument: boolean,
    ): Promise<PaymentIntegrationSelectors> {
        const state = this.paymentIntegrationService.getState();
        const paymentMethod = state.getPaymentMethodOrThrow(methodId);
        const paymentPayload = this._getPaymentPayload(
            methodId,
            paymentMethod.clientToken || '',
            shouldSaveInstrument,
            shouldSetAsDefaultInstrument,
        );

        try {
            return await this.paymentIntegrationService.submitPayment(paymentPayload);
        } catch (error) {
            return this._processAdditionalAction(
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

        if (!isStripeUPEPaymentMethodLike(paymentMethod)) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const {
            initializationData: { stripePublishableKey, stripeConnectedAccount, shopperLanguage },
        } = paymentMethod;

        if (!paymentMethod.clientToken) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        this._stripeUPEClient = await this._loadStripeJs(
            stripePublishableKey,
            stripeConnectedAccount,
        );
        this._isStripeElementUpdateEnabled =
            !!checkoutSettings.features['PI-1679.trigger_update_stripe_payment_element'] &&
            typeof initStripeElementUpdateTrigger === 'function';

        let appearance: StripeUPEAppearanceOptions | undefined;

        if (style) {
            const styles = style;

            appearance = {
                variables: this.stripeUPEIntegrationService.mapAppearanceVariables(style),
                rules: {
                    '.Input': this.stripeUPEIntegrationService.mapInputAppearanceRules(styles),
                },
            };
        }

        this._stripeElements = await this.scriptLoader.getElements(this._stripeUPEClient, {
            clientSecret: paymentMethod.clientToken,
            locale: formatLocale(shopperLanguage),
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
                },
                ...this._getStripeElementTerms(),
            });

        this.stripeUPEIntegrationService.mountElement(stripeElement, containerId);

        stripeElement.on('ready', () => {
            render();
        });

        stripeElement.on('change', (event: StripeEventType) => {
            if (!event?.value || !('type' in event.value)) {
                return;
            }

            this._updateStripeLinkStateByElementType(event.value.type);
        });

        if (this._isStripeElementUpdateEnabled) {
            initStripeElementUpdateTrigger?.(this._updateStripeElement.bind(this));
        }
    }

    // TODO: complexity of _processAdditionalAction method
    // eslint-disable-next-line complexity
    private async _processAdditionalAction(
        error: unknown,
        methodId: string,
        shouldSaveInstrument = false,
        shouldSetAsDefaultInstrument = false,
    ): Promise<PaymentIntegrationSelectors | never> {
        if (!isRequestError(error)) {
            throw error;
        }

        if (!this._stripeUPEClient || !this._stripeElements) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        if (this.stripeUPEIntegrationService.isAdditionalActionError(error.body.errors)) {
            const {
                data: { token, redirect_url },
            } = error.body.additional_action_required;
            const isPaymentCompleted = await this.stripeUPEIntegrationService.isPaymentCompleted(
                methodId,
                this._stripeUPEClient,
            );

            if (
                this.stripeUPEIntegrationService.isRedirectAction(
                    error.body.additional_action_required,
                ) &&
                !isPaymentCompleted
            ) {
                const { paymentIntent, error: stripeError } =
                    await this._stripeUPEClient.confirmPayment(
                        this.stripeUPEIntegrationService.mapStripePaymentData(
                            this._stripeElements,
                            redirect_url,
                        ),
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
                let catchedConfirmError = false;
                const stripePaymentData = this.stripeUPEIntegrationService.mapStripePaymentData(
                    this._stripeElements,
                );
                const isPaymentCompleted =
                    await this.stripeUPEIntegrationService.isPaymentCompleted(
                        methodId,
                        this._stripeUPEClient,
                    );

                try {
                    result = !isPaymentCompleted
                        ? await this._stripeUPEClient.confirmPayment(stripePaymentData)
                        : await this._stripeUPEClient.retrievePaymentIntent(token);
                } catch (error) {
                    try {
                        result = await this._stripeUPEClient.retrievePaymentIntent(token);
                    } catch (error) {
                        catchedConfirmError = true;
                    }
                }

                if (result?.error) {
                    this.stripeUPEIntegrationService.throwDisplayableStripeError(result.error);

                    if (this.stripeUPEIntegrationService.isCancellationError(result.error)) {
                        throw new PaymentMethodCancelledError();
                    }

                    throw new PaymentMethodFailedError();
                }

                if (!result?.paymentIntent && !catchedConfirmError) {
                    throw new RequestError();
                }

                const paymentPayload = this._getPaymentPayload(
                    methodId,
                    catchedConfirmError ? token : result?.paymentIntent?.id,
                    shouldSaveInstrument,
                    shouldSetAsDefaultInstrument,
                );

                try {
                    return await this.paymentIntegrationService.submitPayment(paymentPayload);
                } catch (error) {
                    this.stripeUPEIntegrationService.throwPaymentConfirmationProceedMessage();
                }
            }
        }

        throw error;
    }

    private async _processVaultedAdditionalAction(
        error: unknown,
        methodId?: string,
        shouldSetAsDefaultInstrument = false,
    ): Promise<PaymentIntegrationSelectors | never> {
        if (!isRequestError(error)) {
            throw error;
        }

        if (!this._stripeUPEClient || !this._stripeElements) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        if (some(error.body.errors, { code: 'three_d_secure_required' }) && methodId) {
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
                this.stripeUPEIntegrationService.throwDisplayableStripeError(result.error);

                if (this.stripeUPEIntegrationService.isCancellationError(result.error)) {
                    throw new PaymentMethodCancelledError();
                }

                throw new PaymentMethodFailedError();
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

        throw error;
    }

    private async _loadStripeJs(
        stripePublishableKey: string,
        stripeConnectedAccount: string,
    ): Promise<StripeUPEClient> {
        if (this._stripeUPEClient) {
            return this._stripeUPEClient;
        }

        return this.scriptLoader.getStripeClient(stripePublishableKey, stripeConnectedAccount);
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
