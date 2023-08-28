import { includes, some } from 'lodash';

import { PaymentMethodFailedError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { isHostedInstrumentLike } from '../..';
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
import PaymentActionCreator from '../../payment-action-creator';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import formatLocale from './format-locale';
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
    private _isDeinitialize?: boolean;

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

        this._isDeinitialize = false;

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
                        payment.mount(`#${stripeupe.containerId}`);
                        this._isMounted = true;
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
        this._isDeinitialize = true;

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
        const paymentMethod = this._store
            .getState()
            .paymentMethods.getPaymentMethodOrThrow(methodId);
        const paymentPayload = {
            methodId,
            paymentData: {
                formattedPayload: {
                    credit_card_token: { token: paymentMethod.clientToken },
                    vault_payment_instrument: false,
                    confirm: false,
                    set_as_default_stored_instrument: false,
                },
            },
        };

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
        const paymentMethod = this._store
            .getState()
            .paymentMethods.getPaymentMethodOrThrow(methodId);

        const paymentPayload = {
            methodId,
            paymentData: {
                formattedPayload: {
                    credit_card_token: { token: paymentMethod.clientToken },
                    vault_payment_instrument: shouldSaveInstrument,
                    confirm: false,
                    set_as_default_stored_instrument: shouldSetAsDefaultInstrument,
                },
            },
        };

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

    private async _isPaymentNotComplited(methodId: string) {
        const paymentMethod = this._store
            .getState()
            .paymentMethods.getPaymentMethodOrThrow(methodId);

        if (!paymentMethod.clientToken || !this._stripeUPEClient) {
            return false;
        }

        const retrivedPI = await this._stripeUPEClient.retrievePaymentIntent(
            paymentMethod.clientToken,
        );

        return retrivedPI.paymentIntent?.status !== StripeUPEPaymentIntentStatus.SUCCEEDED;
    }

    private async _executeWithVaulted(
        methodId: string,
        token: string,
        shouldSetAsDefaultInstrument: boolean,
    ): Promise<InternalCheckoutSelectors> {
        const paymentMethod = this._store
            .getState()
            .paymentMethods.getPaymentMethodOrThrow(methodId);

        try {
            const paymentPayload = {
                methodId,
                paymentData: {
                    formattedPayload: {
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

        try {
            stripeElement.mount(`#${containerId}`);
            this._isMounted = true;
        } catch (error) {
            if (!this._isDeinitialize) {
                throw new InvalidArgumentError(
                    'Unable to mount Stripe component without valid container ID.',
                );
            }
        }

        stripeElement.on('ready', () => {
            render();
        });
    }

    private async _processAdditionalAction(
        error: Error,
        methodId?: string,
        shouldSaveInstrument = false,
        shouldSetAsDefaultInstrument = false,
    ): Promise<InternalCheckoutSelectors | never> {
        if (!(error instanceof RequestError)) {
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
            const isPaymentNotComplited = methodId && (await this._isPaymentNotComplited(methodId));

            if (type === 'redirect_to_url' && redirect_url) {
                if (isPaymentNotComplited) {
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
                }
            } else if (methodId && type === 'additional_action_requires_payment_method' && token) {
                let result;
                let catchedConfirmError = false;
                const stripePaymentData = this._mapStripePaymentData();
                const isPaymentNotComplited = await this._isPaymentNotComplited(methodId);

                try {
                    if (isPaymentNotComplited) {
                        result = await this._stripeUPEClient.confirmPayment(stripePaymentData);
                    }
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

                const paymentPayload = {
                    methodId,
                    paymentData: {
                        formattedPayload: {
                            credit_card_token: {
                                token: catchedConfirmError ? token : result?.paymentIntent?.id,
                            },
                            confirm: false,
                            vault_payment_instrument: shouldSaveInstrument,
                            set_as_default_stored_instrument: shouldSetAsDefaultInstrument,
                        },
                    },
                };

                return this._store.dispatch(
                    this._paymentActionCreator.submitPayment(paymentPayload),
                );
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

            const paymentPayload = {
                methodId,
                paymentData: {
                    formattedPayload: {
                        credit_card_token: {
                            token: catchedConfirmError ? clientSecret : result?.paymentIntent?.id,
                        },
                        confirm: false,
                        set_as_default_stored_instrument: shouldSetAsDefaultInstrument,
                    },
                },
            };

            return this._store.dispatch(this._paymentActionCreator.submitPayment(paymentPayload));
        }

        throw error;
    }

    private _mapStripeAddress(address?: Address): AddressOptions {
        if (address) {
            const { city, countryCode: country, postalCode } = address;

            return { city, country, postal_code: postalCode };
        }

        throw new MissingDataError(MissingDataErrorType.MissingBillingAddress);
    }

    private _mapStripePaymentData(returnUrl?: string): StripeConfirmPaymentData {
        const billingAddress = this._store.getState().billingAddress.getBillingAddress();
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

        return this._stripeScriptLoader.getStripeClient(
            stripePublishableKey,
            stripeConnectedAccount,
        );
    }
}
