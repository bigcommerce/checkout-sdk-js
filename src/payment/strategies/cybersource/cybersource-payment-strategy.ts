import { some } from 'lodash';

import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import {
    MissingDataError,
    MissingDataErrorType,
    RequestError
} from '../../../common/error/errors';
import { OrderActionCreator, OrderPaymentRequestBody, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import Payment, { CreditCardInstrument } from '../../payment';
import PaymentActionCreator from '../../payment-action-creator';
import PaymentMethod from '../../payment-method';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import { CardinalClient, CardinalOrderData } from './index';

export default class CyberSourcePaymentStrategy implements PaymentStrategy {
    private _paymentMethod?: PaymentMethod;

    constructor(
        private _store: CheckoutStore,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _orderActionCreator: OrderActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
        private _cardinalClient: CardinalClient
    ) {}

    initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        const { methodId } = options;

        return this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(methodId))
            .then( state => {
                this._paymentMethod = state.paymentMethods.getPaymentMethod(methodId);

                if (!this._paymentMethod || !this._paymentMethod.config || this._paymentMethod.config.testMode === undefined) {
                    throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
                }

                return this._cardinalClient.initialize(this._paymentMethod.config.testMode)
                    .then(() => this._store.getState());
            });
    }

    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { payment, ...order } = payload;

        if (!payment) {
            throw new MissingDataError(MissingDataErrorType.MissingPayment);
        }

        if (!this._paymentMethod || !this._paymentMethod.config) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        return this._paymentMethod.config.is3dsEnabled ? this._placeOrderUsing3DS(order, payment, options, this._paymentMethod.clientToken) :
            this._placeOrder(order, payment, options);
    }

    finalize(options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        return Promise.resolve(this._store.getState());
    }

    private _placeOrderUsing3DS(order: OrderRequestBody, payment: OrderPaymentRequestBody, options?: PaymentRequestOptions, clientToken?: string): Promise<InternalCheckoutSelectors> {
        if (!clientToken) {
            return Promise.reject(new MissingDataError(MissingDataErrorType.MissingPaymentMethod));
        }

        if (!payment.paymentData) {
            throw new MissingDataError(MissingDataErrorType.MissingPayment);
        }

        const paymentData = payment.paymentData as CreditCardInstrument;

        return this._cardinalClient.configure(clientToken)
            .then(() => {
                return this._cardinalClient.runBindProcess(paymentData.ccNumber)
                    .then(() => {
                        return this._placeOrder(order, payment, options).catch(error => {
                            if (!(error instanceof RequestError) || !some(error.body.errors, { code: 'enrolled_card' })) {
                                return Promise.reject(error);
                            }

                            return this._cardinalClient.getThreeDSecureData(error.body.three_ds_result, this._getOrderData(paymentData))
                                .then(threeDSecure =>
                                    this._executePayment({
                                        ...payment,
                                        paymentData: {
                                            ...paymentData,
                                            threeDSecure,
                                        },
                                    })
                            );
                        });
                });
        });
    }

    private _placeOrder(order: OrderRequestBody, payment: OrderPaymentRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        if (!payment.paymentData) {
            throw new MissingDataError(MissingDataErrorType.MissingPayment);
        }

        return this._store.dispatch(this._orderActionCreator.submitOrder(order, options))
            .then(() =>
                this._executePayment({ ...payment, paymentData: payment.paymentData })
            );
    }

    private _executePayment(payment: Payment): Promise<InternalCheckoutSelectors> {
        return this._store.dispatch(
            this._paymentActionCreator.submitPayment(payment)
        );
    }

    private _getOrderData(paymentData: CreditCardInstrument): CardinalOrderData {
        const billingAddress = this._store.getState().billingAddress.getBillingAddress();
        const shippingAddress = this._store.getState().shippingAddress.getShippingAddress();
        const checkout = this._store.getState().checkout.getCheckout();
        const order = this._store.getState().order.getOrder();

        if (!billingAddress || !billingAddress.email) {
            throw new MissingDataError(MissingDataErrorType.MissingBillingAddress);
        }

        if (!checkout) {
            throw new MissingDataError(MissingDataErrorType.MissingCheckout);
        }

        if (!order) {
            throw new MissingDataError(MissingDataErrorType.MissingOrder);
        }

        return {
            billingAddress,
            shippingAddress,
            currencyCode: checkout.cart.currency.code,
            id: order.orderId.toString(),
            amount: checkout.cart.cartAmount,
            paymentData,
        };
    }
}
