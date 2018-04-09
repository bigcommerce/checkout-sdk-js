import { omit, pick } from 'lodash';

import { CheckoutSelectors, CheckoutStore } from '../../checkout';
import { MissingDataError } from '../../common/error/errors';
import { OrderActionCreator, OrderRequestBody, PlaceOrderService } from '../../order';
import Payment from '../payment';
import * as paymentStatusTypes from '../payment-status-types';

import PaymentStrategy from './payment-strategy';

export default class PaypalProPaymentStrategy extends PaymentStrategy {
    constructor(
        store: CheckoutStore,
        placeOrderService: PlaceOrderService,
        private _orderActionCreator: OrderActionCreator
    ) {
        super(store, placeOrderService);
    }

    execute(payload: OrderRequestBody, options: any): Promise<CheckoutSelectors> {
        if (this._isPaymentAcknowledged()) {
            return this._store.dispatch(
                this._orderActionCreator.submitOrder({
                    ...payload,
                    payment: pick(payload.payment, 'name') as Payment,
                }, true, options)
            );
        }

        return this._store.dispatch(this._orderActionCreator.submitOrder(omit(payload, 'payment'), true, options))
            .then(() =>
                this._placeOrderService.submitPayment(payload.payment, payload.useStoreCredit, options)
            );
    }

    private _isPaymentAcknowledged(): boolean {
        const { checkout } = this._store.getState();
        const order = checkout.getOrder();

        if (!order) {
            throw new MissingDataError('Unable to determine payment status because "order" data is missing.');
        }

        return order.payment && order.payment.status === paymentStatusTypes.ACKNOWLEDGE;
    }
}
