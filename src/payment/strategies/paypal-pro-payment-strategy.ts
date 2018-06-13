import { CheckoutStore, InternalCheckoutSelectors } from '../../checkout';
import { OrderActionCreator, OrderRequestBody } from '../../order';
import { PaymentArgumentInvalidError } from '../errors';
import PaymentActionCreator from '../payment-action-creator';
import { PaymentRequestOptions } from '../payment-request-options';
import * as paymentStatusTypes from '../payment-status-types';

import PaymentStrategy from './payment-strategy';

export default class PaypalProPaymentStrategy extends PaymentStrategy {
    constructor(
        store: CheckoutStore,
        private _orderActionCreator: OrderActionCreator,
        private _paymentActionCreator: PaymentActionCreator
    ) {
        super(store);
    }

    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        if (this._isPaymentAcknowledged()) {
            return this._store.dispatch(
                this._orderActionCreator.submitOrder({
                    ...payload,
                    payment: payload.payment ? { methodId: payload.payment.methodId } : undefined,
                }, options)
            );
        }

        const { payment, ...order } = payload;
        const paymentData = payment && payment.paymentData;

        if (!payment || !paymentData) {
            throw new PaymentArgumentInvalidError(['payment.paymentData']);
        }

        return this._store.dispatch(this._orderActionCreator.submitOrder(order, options))
            .then(() =>
                this._store.dispatch(this._paymentActionCreator.submitPayment({ ...payment, paymentData }))
            );
    }

    private _isPaymentAcknowledged(): boolean {
        const state = this._store.getState();

        return state.payment.getPaymentStatus() === paymentStatusTypes.ACKNOWLEDGE;
    }
}
