import { pick } from 'lodash';

import { CheckoutStore, InternalCheckoutSelectors } from '../../checkout';
import { InvalidArgumentError, MissingDataError } from '../../common/error/errors';
import { OrderActionCreator, OrderRequestBody } from '../../order';
import Payment from '../payment';
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
                    payment: pick(payload.payment, 'name') as Payment,
                }, true, options)
            );
        }

        const { payment, ...order } = payload;

        if (!payment) {
            throw new InvalidArgumentError();
        }

        return this._store.dispatch(this._orderActionCreator.submitOrder(order, true, options))
            .then(() =>
                this._store.dispatch(this._paymentActionCreator.submitPayment(payment))
            );
    }

    private _isPaymentAcknowledged(): boolean {
        const state = this._store.getState();
        const order = state.order.getOrder();

        if (!order) {
            throw new MissingDataError('Unable to determine payment status because "order" data is missing.');
        }

        return order.payment && order.payment.status === paymentStatusTypes.ACKNOWLEDGE;
    }
}
