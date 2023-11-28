import { includes, some } from 'lodash';

import { PaymentMethodFailedError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { isHostedInstrumentLike, Payment } from '../..';
import { Address } from '../../../address';
import { BillingAddressActionCreator } from '../../../billing';
import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import {
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    NotInitializedError,
    NotInitializedErrorType,
    RequestError,
} from '../../../common/error/errors';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { StoreCreditActionCreator } from '../../../store-credit';
import { PaymentArgumentInvalidError, PaymentMethodCancelledError } from '../../errors';
import isVaultedInstrument from '../../is-vaulted-instrument';
import { FormattedHostedInstrument, StripeUPEIntent } from '../../payment';
import PaymentActionCreator from '../../payment-action-creator';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import formatLocale from './format-locale';
import {
    AddressOptions,
    BillingDetailsOptions,
    MANUAL_STRIPE_PAYMENT_METHOD_CREATION,
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
    StripeUpeResult,
} from './stripe-upe';
import StripeUPEScriptLoader from './stripe-upe-script-loader';

import { StripeUPEPaymentInitializeOptions } from './';

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
        private _store: CheckoutStore,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
        private _orderActionCreator: OrderActionCreator,
        private _stripeScriptLoader: StripeUPEScriptLoader,
        private _storeCreditActionCreator: StoreCreditActionCreator,
        private _billingAddressActionCreator: BillingAddressActionCreator,
    ) {}

    async initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
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

        this._unsubscribe = await this._store.subscribe(
            async (_state) => {
                const payment = this._stripeElements?.getElement(StripeElementType.PAYMENT);

                if (payment) {
                    let error;

                    await this._store
                        .dispatch(
                            this._paymentMethodActionCreator.loadPaymentMethod(gatewayId, {
                                params: { method: methodId },
                            }),
                        )
                        .catch((err) => (error = err));

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
                const checkout = state.checkout.getCheckout();

                return checkout && checkout.outstandingBalance;
            },
            (state) => {
                const checkout = state.checkout.getCheckout();

                return checkout && checkout.coupons;
            },
        );

        return Promise.resolve(this._store.getState());
    }

    async execute(
        orderRequest: OrderRequestBody,
        options?: PaymentRequestOptions,
    ): Promise<InternalCheckoutSelectors> {
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
        const { isStoreCreditApplied: useStoreCredit } = this._store
            .getState()
            .checkout.getCheckoutOrThrow();

        if (useStoreCredit) {
            await this._store.dispatch(
                this._storeCreditActionCreator.applyStoreCredit(useStoreCredit),
            );
        }

        if (gatewayId) {
            const {
                customer: { getCustomerOrThrow },
            } = await this._store.dispatch(
                this._paymentMethodActionCreator.loadPaymentMethod(gatewayId, {
                    params: { method: methodId },
                }),
            );
            const { email, isStripeLinkAuthenticated } = getCustomerOrThrow();

            if (isStripeLinkAuthenticated !== undefined && !email) {
                const billingAddress = this._store
                    .getState()
                    .billingAddress.getBillingAddressOrThrow();

                await this._store.dispatch(
                    this._billingAddressActionCreator.updateAddress(billingAddress),
                );
            }
        }

        if (isVaultedInstrument(paymentData)) {
            await this._store.dispatch(this._orderActionCreator.submitOrder(order, options));

            const { instrumentId } = paymentData;

            return this._executeWithVaulted(
                payment.methodId,
                instrumentId,
                shouldSetAsDefaultInstrument,
            );
        }

        if (includes(APM_REDIRECT, methodId)) {
            await this._store.dispatch(this._orderActionCreator.submitOrder(order, options));

            return this._executeWithAPM(payment.methodId);
        }

        await this._store.dispatch(this._orderActionCreator.submitOrder(order, options));

        return this._executeWithoutRedirect(
            payment.methodId,
            shouldSaveInstrument,
            shouldSetAsDefaultInstrument,
        );
    }

    finalize(): Promise<InternalCheckoutSelectors> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
        if (this._unsubscribe) {
            this._unsubscribe();
        }

        this._stripeElements?.getElement(StripeElementType.PAYMENT)?.unmount();
        this._isMounted = false;

        return Promise.resolve(this._store.getState());
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

    private async _executeWithAPM(methodId: string): Promise<InternalCheckoutSelectors> {
        const state = this._store.getState();
        const paymentMethod = state.paymentMethods.getPaymentMethodOrThrow(methodId);
        const paymentPayload = this._getPaymentPayload(methodId, paymentMethod.clientToken || '');

        try {
            return await this._store.dispatch(
                this._paymentActionCreator.submitPayment(paymentPayload),
            );
        } catch (error) {
            return await this._processAdditionalAction(error, methodId);
        }
    }

    private async _executeWithoutRedirect(
        methodId: string,
        shouldSaveInstrument: boolean,
        shouldSetAsDefaultInstrument: boolean,
    ): Promise<InternalCheckoutSelectors> {
        const state = this._store.getState();
        const paymentMethod = state.paymentMethods.getPaymentMethodOrThrow(methodId);
        const stripePaymentMethod = await this._createStripePaymentMethod();
        const isBackendConfirmationSupported = this._shouldCreateStripePaymentMethodManually();

        const paymentPayload = this._getPaymentPayload(
            methodId,
            paymentMethod.clientToken || '',
            shouldSaveInstrument,
            shouldSetAsDefaultInstrument,
            stripePaymentMethod?.id,
            isBackendConfirmationSupported,
        );

        try {
            return await this._store.dispatch(
                this._paymentActionCreator.submitPayment(paymentPayload),
            );
        } catch (error) {
            return await this._processAdditionalAction(
                error,
                methodId,
                shouldSaveInstrument,
                shouldSetAsDefaultInstrument,
            );
        }
    }

    private async _isPaymentCompleted(methodId: string) {
        const state = this._store.getState();
        const paymentMethod = state.paymentMethods.getPaymentMethodOrThrow(methodId);
        const { features } = state.config.getStoreConfigOrThrow().checkoutSettings;

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
    ): Promise<InternalCheckoutSelectors> {
        const state = this._store.getState();
        const paymentMethod = state.paymentMethods.getPaymentMethodOrThrow(methodId);
        const cartId = state.cart.getCart()?.id;

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

            return await this._store.dispatch(
                this._paymentActionCreator.submitPayment(paymentPayload),
            );
        } catch (error) {
            if (this._isBackendCardConfirmation(methodId)) {
                return await this._backendConfirmationFlow(
                    error,
                    methodId,
                    false,
                    shouldSetAsDefaultInstrument,
                );
            }

            return await this._processVaultedAdditionalAction(
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
        const state = await this._store.dispatch(
            this._paymentMethodActionCreator.loadPaymentMethod(gatewayId, {
                params: { method: methodId },
            }),
        );
        const paymentMethod = state.paymentMethods.getPaymentMethodOrThrow(methodId);
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

        this._stripeElements = this._stripeScriptLoader.getElements(this._stripeUPEClient, {
            clientSecret: paymentMethod.clientToken,
            locale: formatLocale(shopperLanguage),
            appearance,
            ...(this._isBackendConfirmationEnabled() && {
                paymentMethodCreation: MANUAL_STRIPE_PAYMENT_METHOD_CREATION,
            }),
        });

        const {
            billingAddress: { getBillingAddress },
            shippingAddress: { getShippingAddress },
        } = state;
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

    private async _processAdditionalAction(
        error: Error,
        methodId: string,
        shouldSaveInstrument = false,
        shouldSetAsDefaultInstrument = false,
    ): Promise<InternalCheckoutSelectors | never> {
        if (!(error instanceof RequestError)) {
            throw error;
        }

        if (!this._stripeUPEClient || !this._stripeElements) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        if (
            this._isThreeDSecureRequired(error) &&
            this._isBackendCardConfirmation(methodId) &&
            methodId
        ) {
            return this._backendConfirmationFlow(
                error,
                methodId,
                shouldSaveInstrument,
                shouldSetAsDefaultInstrument,
            );
        } else if (some(error.body.errors, { code: 'additional_action_required' })) {
            const {
                type,
                data: { token, redirect_url },
            } = error.body.additional_action_required;
            const isPaymentCompleted = await this._isPaymentCompleted(methodId);

            if (type === 'redirect_to_url' && redirect_url && !isPaymentCompleted) {
                const { paymentIntent, error: stripeError } =
                    await this._stripeUPEClient.confirmPayment(
                        await this._mapStripePaymentData(redirect_url),
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
                const stripePaymentData = await this._mapStripePaymentData();
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

                this._validateStripeConfirmationResponse(result, catchedConfirmError);

                const paymentPayload = this._getPaymentPayload(
                    methodId,
                    catchedConfirmError ? token : result?.paymentIntent?.id,
                    shouldSaveInstrument,
                    shouldSetAsDefaultInstrument,
                );

                try {
                    return await this._store.dispatch(
                        this._paymentActionCreator.submitPayment(paymentPayload),
                    );
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
    ): Promise<InternalCheckoutSelectors | never> {
        if (!(error instanceof RequestError)) {
            throw error;
        }

        if (!this._stripeUPEClient || !this._stripeElements) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        if (this._isThreeDSecureRequired(error) && methodId) {
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

            this._validateStripeConfirmationResponse(result, catchedConfirmError);

            const paymentPayload = this._getPaymentPayload(
                methodId,
                catchedConfirmError ? clientSecret : result?.paymentIntent?.id,
                false,
                shouldSetAsDefaultInstrument,
            );

            return this._store.dispatch(this._paymentActionCreator.submitPayment(paymentPayload));
        }

        throw error;
    }

    private async _backendConfirmationFlow(
        error: unknown,
        methodId: string,
        shouldSaveInstrument = false,
        shouldSetAsDefaultInstrument = false,
    ): Promise<InternalCheckoutSelectors> {
        if (!(error instanceof RequestError)) {
            throw error;
        }

        if (!this._stripeUPEClient || !this._stripeElements) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        let result;
        let catchedConfirmError = false;
        const isPaymentCompleted = await this._isPaymentCompleted(methodId);
        const clientSecret = error.body.three_ds_result.token;

        try {
            result = !isPaymentCompleted
                ? await this._stripeUPEClient.handleNextAction({ clientSecret })
                : await this._stripeUPEClient.retrievePaymentIntent(clientSecret);
        } catch (error) {
            try {
                result = await this._stripeUPEClient.retrievePaymentIntent(clientSecret);
            } catch (error) {
                catchedConfirmError = true;
            }
        }

        this._validateStripeConfirmationResponse(result, catchedConfirmError);

        const paymentPayload = this._getPaymentPayload(
            methodId,
            catchedConfirmError ? clientSecret : result?.paymentIntent?.id,
            shouldSaveInstrument,
            shouldSetAsDefaultInstrument,
        );

        try {
            return await this._store.dispatch(
                this._paymentActionCreator.submitPayment(paymentPayload),
            );
        } catch (error) {
            // INFO: for case if payment was successfully confirmed on Stripe side but on BC side something go wrong, request failed and order status hasn't changed yet
            // For shopper we need to show additional message that BC is waiting for stripe confirmation, to prevent additional payment creation
            throw new PaymentMethodFailedError(
                "We've received your order and are processing your payment. Once the payment is verified, your order will be completed. We will send you an email when it's completed. Please note, this process may take a few minutes depending on the processing times of your chosen method.",
            );
        }
    }

    private _isBackendConfirmationEnabled(): boolean {
        return !!this._store.getState().config.getStoreConfig()?.checkoutSettings?.features?.[
            'PI-984.move_Stripe_confirm_request_to_backend'
        ];
    }

    private _shouldCreateStripePaymentMethodManually(): boolean {
        return (
            this._isBackendConfirmationEnabled() &&
            this._stripeElements?.paymentMethodCreation === MANUAL_STRIPE_PAYMENT_METHOD_CREATION
        );
    }

    private _isBackendCardConfirmation(methodId: string): boolean {
        return (
            methodId === StripePaymentMethodType.CreditCard &&
            this._shouldCreateStripePaymentMethodManually()
        );
    }

    private _isThreeDSecureRequired(error: RequestError) {
        return some(error.body.errors, { code: 'three_d_secure_required' });
    }

    private async _createStripePaymentMethod() {
        if (!this._stripeUPEClient || !this._stripeElements) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        if (!this._shouldCreateStripePaymentMethodManually()) {
            // INFO: should not create stripe payment method manually if this option wasn't enabled on Stripe elements initialization
            // Stripe Link flow.
            return;
        }

        const { error: submitError } = await this._stripeElements.submit();

        if (submitError) {
            this._throwDisplayableStripeError(submitError);
            throw new PaymentMethodFailedError();
        }

        const { error: stripePaymentMethodError, paymentMethod: stripePaymentMethod } =
            (await this._stripeUPEClient?.createPaymentMethod({
                elements: this._stripeElements,
                params: {
                    billing_details: this._getBillingDetails(),
                },
            })) || {};

        if (stripePaymentMethodError) {
            this._throwDisplayableStripeError(stripePaymentMethodError);
            throw new PaymentMethodFailedError();
        }

        return stripePaymentMethod;
    }

    private _validateStripeConfirmationResponse(
        result?: StripeUpeResult,
        catchedConfirmError?: boolean,
    ) {
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

    private _getBillingDetails(): BillingDetailsOptions {
        const billingAddress = this._store.getState().billingAddress.getBillingAddress();
        const address = this._mapStripeAddress(billingAddress);
        const email = billingAddress?.email;

        if (!email || !address || !address.city || !address.country) {
            throw new MissingDataError(MissingDataErrorType.MissingBillingAddress);
        }

        return {
            email,
            address,
        };
    }

    private async _mapStripePaymentData(returnUrl?: string): Promise<StripeConfirmPaymentData> {
        if (!this._stripeElements) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        const stripePaymentMethod = await this._createStripePaymentMethod();

        return {
            elements: this._stripeElements,
            redirect: StripeStringConstants.IF_REQUIRED,
            confirmParams: {
                payment_method_data: {
                    billing_details: this._getBillingDetails(),
                },
                ...(returnUrl && { return_url: returnUrl }),
                ...(stripePaymentMethod && { payment_method: stripePaymentMethod.id }),
                is_backend_confirmation_supported: this._shouldCreateStripePaymentMethodManually(),
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

        return this._stripeScriptLoader.getStripeClient(
            stripePublishableKey,
            stripeConnectedAccount,
        );
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
        stripePaymentMethodId?: string,
        isBackendConfirmationSupported = false,
    ): Payment {
        const cartId = this._store.getState().cart.getCart()?.id || '';
        const formattedPayload: StripeUPEIntent & FormattedHostedInstrument = {
            cart_id: cartId,
            credit_card_token: { token },
            confirm: false,
            vault_payment_instrument: shouldSaveInstrument,
            set_as_default_stored_instrument: shouldSetAsDefaultInstrument,
            ...(stripePaymentMethodId && { payment_method_id: stripePaymentMethodId }),
            ...(isBackendConfirmationSupported && {
                is_backend_confirmation_supported: isBackendConfirmationSupported,
            }),
        };

        return {
            methodId,
            paymentData: {
                formattedPayload,
            },
        };
    }
}
