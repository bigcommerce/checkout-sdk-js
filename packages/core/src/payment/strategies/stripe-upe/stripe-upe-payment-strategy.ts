import { includes, some } from 'lodash';

import { isHostedInstrumentLike } from '../..';
import { Address } from '../../../address';
import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType, NotInitializedError, NotInitializedErrorType, RequestError } from '../../../common/error/errors';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { StoreCreditActionCreator } from '../../../store-credit';
import { PaymentArgumentInvalidError, PaymentMethodCancelledError, PaymentMethodFailedError } from '../../errors';
import isVaultedInstrument from '../../is-vaulted-instrument';
import PaymentActionCreator from '../../payment-action-creator';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import formatLocale from './format-locale';
import { AddressOptions, StripeConfirmPaymentData, StripeElement, StripeElements, StripeError, StripePaymentMethodType, StripeStringConstants, StripeUPEAppearanceOptions, StripeUPEClient } from './stripe-upe';
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
    private _unsubscribe?: (() => void);

    constructor(
        private _store: CheckoutStore,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
        private _orderActionCreator: OrderActionCreator,
        private _stripeScriptLoader: StripeUPEScriptLoader,
        private _storeCreditActionCreator: StoreCreditActionCreator
    ) {}

    async initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        const { stripeupe, methodId, gatewayId } = options;
        if (!stripeupe?.containerId) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        if (!gatewayId) {
            throw new InvalidArgumentError('Unable to initialize payment because "gatewayId" argument is not provided.');
        }

        this._unsubscribe = await this._store.subscribe(
            async _state => {
                const payment = this._stripeElements?.getElement(StripeStringConstants.PAYMENT);
                if (payment) {
                    let error;
                    await this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(gatewayId, { params: { method: methodId } })).catch(err => error = err);
                    if (error) {
                        if (this._isMounted) {
                            payment.unmount();
                            this._isMounted = false;
                        }
                        stripeupe.onError?.(error);
                    } else {
                        if (!this._isMounted) {
                            payment.mount(`#${stripeupe.containerId}`);
                            this._isMounted = true;
                        }
                    }
                } else {
                    this._loadStripeElement(stripeupe.containerId, stripeupe.style, gatewayId, methodId)
                        .catch(error => stripeupe.onError?.(error));
                }
            },
            state => {
                const checkout = state.checkout.getCheckout();

                return checkout && checkout.outstandingBalance;
            },
            state => {
                const checkout = state.checkout.getCheckout();

                return checkout && checkout.coupons;
            }
        );

        return Promise.resolve(this._store.getState());
    }

    async execute(orderRequest: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { payment, ...order } = orderRequest;

        if (!payment || !payment.paymentData) {
            throw new PaymentArgumentInvalidError(['payment.paymentData']);
        }

        if (!this._stripeUPEClient) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        const { paymentData, methodId } = payment;
        const { shouldSaveInstrument = false, shouldSetAsDefaultInstrument = false } = isHostedInstrumentLike(paymentData) ? paymentData : {};
        const { isStoreCreditApplied : useStoreCredit } = this._store.getState().checkout.getCheckoutOrThrow();

        if (useStoreCredit) {
            await this._store.dispatch(this._storeCreditActionCreator.applyStoreCredit(useStoreCredit));
        }

        if (isVaultedInstrument(paymentData)) {
            await this._store.dispatch(this._orderActionCreator.submitOrder(order, options));
            const { instrumentId } = paymentData;

            return await this._executeWithVaulted(payment.methodId, instrumentId, shouldSetAsDefaultInstrument);
        }

        if (includes(APM_REDIRECT, methodId)) {
            await this._store.dispatch(this._orderActionCreator.submitOrder(order, options));

            return await this._executeWithAPM(payment.methodId);
        }

        const { paymentIntent, error } = await this._stripeUPEClient.confirmPayment(this._mapStripePaymentData());

        if (error) {
            this._throwDisplayableStripeError(error);
            throw new PaymentMethodFailedError();
        }

        if (!paymentIntent) {
            throw new RequestError();
        }

        await this._store.dispatch(this._orderActionCreator.submitOrder(order, options));

        const paymentPayload = {
            methodId,
            paymentData: {
                formattedPayload: {
                    credit_card_token: { token: paymentIntent.id},
                    vault_payment_instrument: shouldSaveInstrument,
                    confirm: false,
                    set_as_default_stored_instrument: shouldSetAsDefaultInstrument,
                },
            },
        };

        return await this._store.dispatch(this._paymentActionCreator.submitPayment(paymentPayload));
    }

    finalize(): Promise<InternalCheckoutSelectors> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
        if (this._unsubscribe) {
            this._unsubscribe();
        }
        this._stripeElements?.getElement(StripeStringConstants.PAYMENT)?.unmount();
        this._isMounted = false;

        return Promise.resolve(this._store.getState());
    }

    private _isCancellationError(stripeError: StripeError | undefined) {
        return stripeError && stripeError.payment_intent.last_payment_error?.message?.indexOf('canceled') !== -1;
    }

    private _throwDisplayableStripeError(stripeError: StripeError) {
        if (includes(['card_error', 'invalid_request_error', 'validation_error'], stripeError.type)) {
            throw new Error(stripeError.message);
        }
    }

    private async _executeWithAPM(methodId: string): Promise<InternalCheckoutSelectors> {
        const paymentMethod = this._store.getState().paymentMethods.getPaymentMethodOrThrow(methodId);
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
            return await this._store.dispatch(this._paymentActionCreator.submitPayment(paymentPayload));
        } catch (error) {
            return await this._processAdditionalAction(error);
        }
    }

    private async _executeWithVaulted(methodId: string, token: string, shouldSetAsDefaultInstrument: boolean): Promise<InternalCheckoutSelectors> {
        const paymentMethod = this._store.getState().paymentMethods.getPaymentMethodOrThrow(methodId);
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

            return await this._store.dispatch(this._paymentActionCreator.submitPayment(paymentPayload));
        } catch (error) {
            return await this._processVaultedAdditionalAction(error, methodId, shouldSetAsDefaultInstrument);
        }
    }

    private async _loadStripeElement(containerId: string, style: { [key: string]: string } | undefined, gatewayId: string, methodId: string) {
        const state = await this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(gatewayId, { params: { method: methodId } }));
        const paymentMethod = state.paymentMethods.getPaymentMethodOrThrow(methodId);
        const { initializationData: { stripePublishableKey, stripeConnectedAccount, shopperLanguage } } = paymentMethod;

        if (!paymentMethod.clientToken) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        this._stripeUPEClient = await this._loadStripeJs(stripePublishableKey, stripeConnectedAccount);
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

        this._stripeElements = this._stripeElements ?? this._stripeUPEClient.elements({
            clientSecret: paymentMethod.clientToken,
            locale: formatLocale(shopperLanguage),
            appearance,
        });

        const stripeElement: StripeElement = this._stripeElements.getElement(StripeStringConstants.PAYMENT) || this._stripeElements.create(StripeStringConstants.PAYMENT,
            {
                fields: {
                    billingDetails: {
                        email: StripeStringConstants.NEVER,
                        address: {
                            country: StripeStringConstants.NEVER,
                            city: StripeStringConstants.NEVER,
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
            throw new InvalidArgumentError('Unable to mount Stripe component without valid container ID.');
        }
    }

    private async _processAdditionalAction(error: Error): Promise<InternalCheckoutSelectors | never> {
        if (!(error instanceof RequestError)) {
            throw error;
        }

        if (!this._stripeUPEClient || !this._stripeElements) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }
        if (some(error.body.errors, { code: 'additional_action_required' })) {
            const action = error.body.additional_action_required;

            if (action && action.type === 'redirect_to_url' && action.data.redirect_url) {
                const { paymentIntent, error: stripeError } = await this._stripeUPEClient.confirmPayment(this._mapStripePaymentData(action.data.redirect_url));

                if (stripeError) {
                    this._throwDisplayableStripeError(stripeError);
                    throw new PaymentMethodFailedError();
                }
                if (!paymentIntent) {
                    throw new RequestError();
                }
            }
        }

        throw error;
    }

    private async _processVaultedAdditionalAction(
        error: Error,
        methodId?: string,
        shouldSetAsDefaultInstrument = false): Promise<InternalCheckoutSelectors | never> {
        if (!(error instanceof RequestError)) {
            throw error;
        }

        if (!this._stripeUPEClient || !this._stripeElements) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        if (some(error.body.errors, { code: 'three_d_secure_required' }) && methodId) {
            const clientSecret = error.body.three_ds_result.token;

            const { paymentIntent, error: stripeError } = await this._stripeUPEClient.confirmCardPayment(clientSecret);

            if (stripeError) {
                this._throwDisplayableStripeError(stripeError);
                if (this._isCancellationError(stripeError)) {
                    throw new PaymentMethodCancelledError();
                }
                throw new PaymentMethodFailedError();
            }
            if (!paymentIntent) {
                throw new RequestError();
            }

            const paymentPayload = {
                methodId,
                paymentData: {
                    formattedPayload: {
                        credit_card_token: { token: paymentIntent.id },
                        confirm: false,
                        set_as_default_stored_instrument: shouldSetAsDefaultInstrument,
                    },
                },
            };

            return await this._store.dispatch(this._paymentActionCreator.submitPayment(paymentPayload));
        }

        throw error;
    }

    private _mapStripeAddress(address?: Address): AddressOptions {
        if (address) {
            const {
                city,
                countryCode: country,
            } = address;

            return { city, country };
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

    private async _loadStripeJs(stripePublishableKey: string, stripeConnectedAccount: string): Promise<StripeUPEClient> {
        if (this._stripeUPEClient) {
            return this._stripeUPEClient;
        }

        return await this._stripeScriptLoader.load(
            stripePublishableKey,
            stripeConnectedAccount
        );
    }
}
