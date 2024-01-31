import { includes, some } from 'lodash';

import {
    Address,
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
    AddressOptions,
    StripeConfirmPaymentData,
    StripeElement,
    StripeElements,
    StripeElementType,
    StripeError,
    StripePaymentMethodType,
    StripeStringConstants,
    StripeUPEAppearanceOptions,
    StripeUPEClient,
    StripeUPEPaymentIntentStatus,
} from './stripe-upe';
import StripeUPEPaymentInitializeOptions, {
    WithStripeUPEPaymentInitializeOptions,
} from './stripe-upe-initialize-options';
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
    private _isMounted = false;
    private _unsubscribe?: () => void;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private scriptLoader: StripeUPEScriptLoader,
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

        this._unsubscribe = this.paymentIntegrationService.subscribe(
            async () => {
                const payment = this._stripeElements?.getElement(StripeElementType.PAYMENT);

                if (payment) {
                    let error;

                    try {
                        await this.paymentIntegrationService.loadPaymentMethod(gatewayId, {
                            params: { method: methodId },
                        });
                    } catch (err) {
                        error = err;
                    }

                    if (error) {
                        if (this._isMounted) {
                            payment.unmount();
                            this._isMounted = false;
                        }

                        stripeupe.onError?.(error);
                    } else if (!this._isMounted) {
                        await this._stripeElements?.fetchUpdates();
                        this._mountElement(payment, stripeupe.containerId);
                    }
                }
            },
            (state) => {
                const checkout = state.getCheckout();

                return checkout && checkout.outstandingBalance;
            },
            (state) => {
                const checkout = state.getCheckout();

                return checkout && checkout.coupons;
            },
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
        if (this._unsubscribe) {
            this._unsubscribe();
        }

        this._stripeElements?.getElement(StripeElementType.PAYMENT)?.unmount();
        this._isMounted = false;

        return Promise.resolve();
    }

    private _isCancellationError(stripeError: StripeError | undefined) {
        return (
            stripeError &&
            stripeError.payment_intent.last_payment_error?.message?.indexOf('canceled') !== -1
        );
    }

    private _throwDisplayableStripeError(stripeError: StripeError) {
        if (
            includes(['card_error', 'invalid_request_error', 'validation_error'], stripeError.type)
        ) {
            throw new Error(stripeError.message);
        }
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

    private async _isPaymentCompleted(methodId: string) {
        const state = this.paymentIntegrationService.getState();
        const paymentMethod = state.getPaymentMethodOrThrow(methodId);
        const { features } = state.getStoreConfigOrThrow().checkoutSettings;

        if (
            !paymentMethod.clientToken ||
            !this._stripeUPEClient ||
            !features['PI-626.Block_unnecessary_payment_confirmation_for_StripeUPE']
        ) {
            return false;
        }

        const retrivedPI = await this._stripeUPEClient.retrievePaymentIntent(
            paymentMethod.clientToken,
        );

        return retrivedPI.paymentIntent?.status === StripeUPEPaymentIntentStatus.SUCCEEDED;
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
        const { containerId, style, render } = stripeupe;
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

        this._stripeUPEClient = await this._loadStripeJs(
            stripePublishableKey,
            stripeConnectedAccount,
        );

        let appearance: StripeUPEAppearanceOptions | undefined;

        if (style) {
            const styles = style;

            appearance = {
                variables: {
                    colorPrimary: styles.fieldInnerShadow,
                    colorBackground: styles.fieldBackground,
                    colorText: styles.labelText,
                    colorDanger: styles.fieldErrorText,
                    colorTextSecondary: styles.labelText,
                    colorTextPlaceholder: styles.fieldPlaceholderText,
                    colorIcon: styles.fieldPlaceholderText,
                },
                rules: {
                    '.Input': {
                        borderColor: styles.fieldBorder,
                        color: styles.fieldText,
                        boxShadow: styles.fieldInnerShadow,
                    },
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
            });

        this._mountElement(stripeElement, containerId);

        stripeElement.on('ready', () => {
            render();
        });
    }

    // TODO: complexity of _processAdditionalAction method
    // eslint-disable-next-line complexity
    private async _processAdditionalAction(
        error: Error,
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

        if (some(error.body.errors, { code: 'additional_action_required' })) {
            const {
                type,
                data: { token, redirect_url },
            } = error.body.additional_action_required;
            const isPaymentCompleted = await this._isPaymentCompleted(methodId);

            if (type === 'redirect_to_url' && redirect_url && !isPaymentCompleted) {
                const { paymentIntent, error: stripeError } =
                    await this._stripeUPEClient.confirmPayment(
                        this._mapStripePaymentData(redirect_url),
                    );

                if (stripeError) {
                    this._throwDisplayableStripeError(stripeError);
                    throw new PaymentMethodFailedError();
                }

                if (!paymentIntent) {
                    throw new RequestError();
                }
            } else if (type === 'additional_action_requires_payment_method' && token) {
                let result;
                let catchedConfirmError = false;
                const stripePaymentData = this._mapStripePaymentData();
                const isPaymentCompleted = await this._isPaymentCompleted(methodId);

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
                    this._throwDisplayableStripeError(result.error);

                    if (this._isCancellationError(result.error)) {
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
                    // INFO: for case if payment was successfully confirmed on Stripe side but on BC side something go wrong, request failed and order status hasn't changed yet
                    // For shopper we need to show additional message that BC is waiting for stripe confirmation, to prevent additional payment creation
                    throw new PaymentMethodFailedError(
                        "We've received your order and are processing your payment. Once the payment is verified, your order will be completed. We will send you an email when it's completed. Please note, this process may take a few minutes depending on the processing times of your chosen method.",
                    );
                }
            }
        }

        throw error;
    }

    private async _processVaultedAdditionalAction(
        error: Error,
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
                this._throwDisplayableStripeError(result.error);

                if (this._isCancellationError(result.error)) {
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

    private _mapStripeAddress(address?: Address): AddressOptions {
        if (address) {
            const { city, address1, address2, countryCode: country, postalCode } = address;

            return {
                city,
                country,
                postal_code: postalCode,
                line1: address1,
                line2: address2,
            };
        }

        throw new MissingDataError(MissingDataErrorType.MissingBillingAddress);
    }

    private _mapStripePaymentData(returnUrl?: string): StripeConfirmPaymentData {
        const billingAddress = this.paymentIntegrationService.getState().getBillingAddress();
        const address = this._mapStripeAddress(billingAddress);

        const email = billingAddress?.email;

        if (!this._stripeElements) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        if (!email || !address || !address.city || !address.country) {
            throw new MissingDataError(MissingDataErrorType.MissingBillingAddress);
        }

        return {
            elements: this._stripeElements,
            redirect: StripeStringConstants.IF_REQUIRED,
            confirmParams: {
                payment_method_data: {
                    billing_details: {
                        email,
                        address,
                    },
                },
                ...(returnUrl && { return_url: returnUrl }),
            },
        };
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

    private _mountElement(stripeElement: StripeElement, containerId: string): void {
        if (!document.getElementById(containerId)) {
            return;
        }

        stripeElement.mount(`#${containerId}`);
        this._isMounted = true;
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
}
