import { includes, some } from 'lodash';

import { isHostedInstrumentLike } from '../..';
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

import { StripeAdditionalAction, StripeElement, StripeElements, StripePaymentMethodType, StripeUPEClient } from './stripe-upe';
import StripeUPEScriptLoader from './stripe-upe-script-loader';

const APM_REDIRECT = [StripePaymentMethodType.SOFORT];

export default class StripeUPEPaymentStrategy implements PaymentStrategy {
    private _stripeUPEClient?: StripeUPEClient;
    private _stripeElements?: StripeElements;

    constructor(
        private _store: CheckoutStore,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
        private _orderActionCreator: OrderActionCreator,
        private _stripeScriptLoader: StripeUPEScriptLoader,
        private _storeCreditActionCreator: StoreCreditActionCreator,
        private _locale: string
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
        const { initializationData: { stripePublishableKey, stripeConnectedAccount } } = paymentMethod;

        if (!paymentMethod.clientToken) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        this._stripeUPEClient = await this._loadStripeJs(stripePublishableKey, stripeConnectedAccount);

        this._stripeElements = this._stripeElements ?? this._stripeUPEClient.elements({
            clientSecret: paymentMethod.clientToken,
        });

        const stripeElement: StripeElement = this._stripeElements.getElement('payment') || this._stripeElements.create('payment',
        {
            wallets: {
                applePay: 'never',
                googlePay: 'never',
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

        if (!this._stripeUPEClient || !this._stripeElements) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }
        const { paymentData, methodId } = payment;
        const { shouldSaveInstrument = false, shouldSetAsDefaultInstrument = false } = isHostedInstrumentLike(paymentData) ? paymentData : {};

        const { isStoreCreditApplied : useStoreCredit } = this._store.getState().checkout.getCheckoutOrThrow();

        if (useStoreCredit) {
            await this._store.dispatch(this._storeCreditActionCreator.applyStoreCredit(useStoreCredit));
        }

        const paymentMethod = this._store.getState().paymentMethods.getPaymentMethodOrThrow(methodId);

        const shouldSubmitOrderBeforeLoadingAPM = includes(APM_REDIRECT, methodId);

        try {
            if (shouldSubmitOrderBeforeLoadingAPM) {
                await this._store.dispatch(this._orderActionCreator.submitOrder(order, options));
                const paymentPayload = {
                    methodId,
                    paymentData: {
                        formattedPayload: {
                            credit_card_token: { token: paymentMethod.clientToken},
                            vault_payment_instrument: shouldSaveInstrument,
                            confirm: false,
                        },
                        shouldSetAsDefaultInstrument,
                    },
                };

                return await this._store.dispatch(this._paymentActionCreator.submitPayment(paymentPayload));
            }

            const { paymentIntent, error } = await this._stripeUPEClient.confirmPayment({
                elements: this._stripeElements,
                redirect: 'if_required',
                confirmParams: {
                    return_url: paymentMethod.returnUrl,
                },
            });

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
            return await this._processAdditionalAction(
                this._handleEmptyPaymentIntentError(error)
            );
        }
    }

    finalize(): Promise<InternalCheckoutSelectors> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
        this._stripeElements?.getElement('payment')?.unmount();

        return Promise.resolve(this._store.getState());
    }

    private _handleEmptyPaymentIntentError(
        error: Error
    ) {
        if (!(error instanceof RequestError)) {
            return error;
        }

        return error;
    }

    private async _processAdditionalAction(
        error: Error
    ): Promise<InternalCheckoutSelectors | never> {
        if (!(error instanceof RequestError)) {
            throw error;
        }

        const isAdditionalActionError = some(error.body.errors, { code: 'additional_action_required' });

        if (isAdditionalActionError) {
            const action: StripeAdditionalAction = error.body.additional_action_required;

            if (action && action.type === 'redirect_to_url') {
                return new Promise(() => {
                    if (action.data.redirect_url) {
                        window.location.replace(action.data.redirect_url);
                    }
                });
            }
        }

        throw error;
    }

    private async _loadStripeJs(stripePublishableKey: string, stripeConnectedAccount: string): Promise<StripeUPEClient> {
        if (this._stripeUPEClient) {
            return this._stripeUPEClient;
        }

        return await this._stripeScriptLoader.load(
            stripePublishableKey,
            stripeConnectedAccount,
            this._locale
        );
    }
}
