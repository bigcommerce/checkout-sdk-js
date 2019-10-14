import { find, some } from 'lodash';

import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType, RequestError } from '../../../common/error/errors';
import isCreditCardLike from '../../is-credit-card-like';
import isVaultedInstrument from '../../is-vaulted-instrument';
import Payment from '../../payment';
import PaymentActionCreator from '../../payment-action-creator';
import PaymentMethod from '../../payment-method';
import PaymentMethodActionCreator from '../../payment-method-action-creator';

import { CardinalClient, CardinalOrderData, CardinalSupportedPaymentInstrument } from './index';

export default class CardinalThreeDSecureFlow {
    private _paymentMethod?: PaymentMethod;
    private _clientToken?: string;

    constructor(
        private _store: CheckoutStore,
        private _paymentActionCreator: PaymentActionCreator,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _cardinalClient: CardinalClient
    ) {}

    prepare(methodId: string): Promise<void> {
        if (this._clientToken) {
            return Promise.resolve();
        }

        return this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(methodId))
            .then(state => {
                this._paymentMethod = state.paymentMethods.getPaymentMethod(methodId);

                if (!this._paymentMethod || !this._paymentMethod.config) {
                    throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
                }

                return this._cardinalClient.initialize(methodId, this._paymentMethod.config.testMode);
            })
            .then(() => {
                if (!this._paymentMethod || !this._paymentMethod.clientToken) {
                    throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
                }

                this._clientToken = this._paymentMethod.clientToken;

                return this._cardinalClient.configure(this._clientToken);
            });
    }

    start(payment: Payment): Promise<InternalCheckoutSelectors> {
        if (!payment.paymentData) {
            throw new MissingDataError(MissingDataErrorType.MissingPayment);
        }

        if (!isCreditCardLike(payment.paymentData) && !isVaultedInstrument(payment.paymentData)) {
            throw new InvalidArgumentError();
        }

        const paymentData = payment.paymentData;

        return this._cardinalClient.runBinProcess(this._getBinNumber(paymentData))
            .then(() => {
                if (!this._clientToken) {
                    throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
                }

                payment = {
                    ...payment,
                    paymentData: {
                        ...paymentData,
                        threeDSecure: { token: this._clientToken },
                    },
                };

                return this._store.dispatch(this._paymentActionCreator.submitPayment(payment));
            })
            .catch(error => {
                if (!(error instanceof RequestError) || !some(error.body.errors, {code: 'three_d_secure_required'})) {
                    return Promise.reject(error);
                }

                return this._cardinalClient.getThreeDSecureData(
                    error.body.three_ds_result,
                    this._getOrderData(paymentData)
                )
                .then(threeDSecure =>
                    this._store.dispatch(this._paymentActionCreator.submitPayment({
                        ...payment,
                        paymentData: {
                            ...paymentData,
                            threeDSecure,
                        },
                    }))
                );
            });
    }

    private _getBinNumber(payment: CardinalSupportedPaymentInstrument): string {
        if (isVaultedInstrument(payment)) {
            const instruments = this._store.getState().instruments.getInstruments();

            const { instrumentId } = payment;

            const entry = find(instruments, { bigpayToken: instrumentId });

            return entry && entry.iin || '';
        }

        return payment.ccNumber;
    }

    private _getOrderData(paymentData: CardinalSupportedPaymentInstrument): CardinalOrderData {
        const state = this._store.getState();
        const billingAddress = state.billingAddress.getBillingAddress();
        const shippingAddress = state.shippingAddress.getShippingAddress();
        const checkout = state.checkout.getCheckout();
        const order = state.order.getOrder();

        if (!billingAddress || !billingAddress.email) {
            throw new MissingDataError(MissingDataErrorType.MissingBillingAddress);
        }

        if (!checkout) {
            throw new MissingDataError(MissingDataErrorType.MissingCheckout);
        }

        if (!order) {
            throw new MissingDataError(MissingDataErrorType.MissingOrder);
        }

        const payment: CardinalOrderData = {
            billingAddress,
            shippingAddress,
            currencyCode: checkout.cart.currency.code,
            id: order.orderId.toString(),
            amount: checkout.cart.cartAmount,
        };

        if (isCreditCardLike(paymentData)) {
            payment.paymentData = paymentData;
        }

        return payment;
    }
}
