import { omit, pick } from 'lodash';

import { CheckoutSelectors } from '../../checkout';
import { MissingDataError } from '../../common/error/errors';
import { OrderRequestBody } from '../../order';
import * as paymentStatusTypes from '../payment-status-types';

import PaymentStrategy from './payment-strategy';

export default class PaypalProPaymentStrategy extends PaymentStrategy {
    execute(payload: OrderRequestBody, options: any): Promise<CheckoutSelectors> {
        if (this._isPaymentAcknowledged()) {
            return this._placeOrderService.submitOrder({
                ...payload,
                payment: pick(payload.payment, 'name'),
            }, options);
        }

        return this._placeOrderService.submitOrder(omit(payload, 'payment'), options)
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
