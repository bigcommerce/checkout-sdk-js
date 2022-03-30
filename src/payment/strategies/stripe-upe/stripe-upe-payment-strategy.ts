import { includes, some } from 'lodash';

import { isHostedInstrumentLike } from '../..';
import { Address } from '../../../address';
import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType, NotInitializedError, NotInitializedErrorType, RequestError } from '../../../common/error/errors';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { StoreCreditActionCreator } from '../../../store-credit';
import { PaymentArgumentInvalidError } from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import formatLocale from './format-locale';
import { AddressOptions, StripeConfirmPaymentData, StripeElement, StripeElements, StripePaymentMethodType, StripeStringConstants, StripeUPEClient } from './stripe-upe';
import StripeUPEScriptLoader from './stripe-upe-script-loader';

const APM_REDIRECT = [
  StripePaymentMethodType.SOFORT,
  StripePaymentMethodType.EPS,
  StripePaymentMethodType.GRABPAY,
  StripePaymentMethodType.BANCONTACT,
  StripePaymentMethodType.IDEAL,
  StripePaymentMethodType.GIROPAY,
  StripePaymentMethodType.ALIPAY,
];

export default class StripeUPEPaymentStrategy implements PaymentStrategy {
    private _stripeUPEClient?: StripeUPEClient;
    private _stripeElements?: StripeElements;

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

        const state = await this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(`${gatewayId}?method=${methodId}`));
        const paymentMethod = state.paymentMethods.getPaymentMethodOrThrow(methodId);
        const { initializationData: { stripePublishableKey, stripeConnectedAccount, shopperLanguage } } = paymentMethod;

        if (!paymentMethod.clientToken) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        this._stripeUPEClient = await this._loadStripeJs(stripePublishableKey, stripeConnectedAccount);

        this._stripeElements = this._stripeElements ?? this._stripeUPEClient.elements({
            clientSecret: paymentMethod.clientToken,
            locale: formatLocale(shopperLanguage),
        });

        const stripeElement: StripeElement = this._stripeElements.getElement(StripeStringConstants.PAYMENT) || this._stripeElements.create(StripeStringConstants.PAYMENT,
        {
            fields: {
                billingDetails: {
                    email: StripeStringConstants.NEVER,
                    address: {
                        country: StripeStringConstants.NEVER,
                        postalCode: StripeStringConstants.NEVER,
                        state: StripeStringConstants.NEVER,
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
            stripeElement.mount(`#${stripeupe.containerId}`);
        } catch (error) {
            throw new InvalidArgumentError('Unable to mount Stripe component without valid container ID.');
        }

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

        try {
            if (includes(APM_REDIRECT, methodId)) {
                await this._store.dispatch(this._orderActionCreator.submitOrder(order, options));
                const paymentMethod = this._store.getState().paymentMethods.getPaymentMethodOrThrow(methodId);
                const paymentPayload = {
                    methodId,
                    paymentData: {
                        formattedPayload: {
                            credit_card_token: { token: paymentMethod.clientToken },
                            vault_payment_instrument: shouldSaveInstrument,
                            confirm: false,
                        },
                        shouldSetAsDefaultInstrument,
                    },
                };

                return await this._store.dispatch(this._paymentActionCreator.submitPayment(paymentPayload));
            }

            const { paymentIntent, error } = await this._stripeUPEClient.confirmPayment(this._mapStripePaymentData());

            if (error || !paymentIntent) {
                if (error && includes(['card_error', 'invalid_request_error', 'validation_error'], error.type)) {
                    throw new Error(error.message);
                }
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
                    },
                    shouldSetAsDefaultInstrument,
                },
            };

            return await this._store.dispatch(this._paymentActionCreator.submitPayment(paymentPayload));
        } catch (error) {
            return await this._processAdditionalAction(error);
        }
    }

    finalize(): Promise<InternalCheckoutSelectors> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
        this._stripeElements?.getElement(StripeStringConstants.PAYMENT)?.unmount();

        return Promise.resolve(this._store.getState());
    }

    private async _processAdditionalAction(error: Error | unknown): Promise<InternalCheckoutSelectors | never> {
        if (!(error instanceof RequestError)) {
            throw error;
        }

        if (some(error.body.errors, { code: 'additional_action_required' })) {
            if (!this._stripeUPEClient || !this._stripeElements) {
                throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
            }

            const action = error.body.additional_action_required;

            if (action && action.type === 'redirect_to_url' && action.data.redirect_url) {
                const { paymentIntent, error: stripeError } = await this._stripeUPEClient.confirmPayment({
                    elements: this._stripeElements,
                    redirect: StripeStringConstants.IF_REQUIRED,
                    confirmParams: {
                        return_url: action.data.redirect_url,
                    },
                });

                if (stripeError || !paymentIntent) {
                    if (stripeError && includes(['card_error', 'invalid_request_error', 'validation_error'], stripeError.type)) {
                        throw new Error(stripeError.message);
                    }
                    throw new RequestError();
                }
            }
        }

        throw error;
    }

    private _mapStripeAddress(address?: Address): AddressOptions {
        if (address) {
            const {
                city,
                countryCode: country,
                postalCode,
                stateOrProvince: state,
            } = address;

            return { city, country, postal_code: postalCode, state };
        }

        throw new MissingDataError(MissingDataErrorType.MissingBillingAddress);
    }

    private _mapStripePaymentData(): StripeConfirmPaymentData {
        const billingAddress = this._store.getState().billingAddress.getBillingAddress();
        const address = this._mapStripeAddress(billingAddress);

        const email = billingAddress?.email;

        if (!this._stripeElements) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        if (!email || !address || !address.city || !address.country || !address.postal_code || !address.state) {
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
