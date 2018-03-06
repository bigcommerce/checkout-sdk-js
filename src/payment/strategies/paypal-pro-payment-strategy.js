import { omit, pick } from 'lodash';
import * as paymentStatusTypes from '../payment-status-types';
import PaymentStrategy from './payment-strategy';

export default class PaypalProPaymentStrategy extends PaymentStrategy {
    /**
     * @inheritdoc
     */
    execute(payload, options) {
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

    /**
     * @private
     * @return {boolean}
     */
    _isPaymentAcknowledged() {
        const { checkout } = this._store.getState();
        const { payment = {} } = checkout.getOrder();

        return payment.status === paymentStatusTypes.ACKNOWLEDGE;
    }
}
