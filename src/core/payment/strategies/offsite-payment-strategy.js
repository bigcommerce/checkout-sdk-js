import { omit } from 'lodash';
import * as paymentStatusTypes from '../payment-status-types';
import PaymentStrategy from './payment-strategy';

export default class OffsitePaymentStrategy extends PaymentStrategy {
    /**
     * @inheritdoc
     */
    execute(payload, options) {
        const { payment: { gateway } = {} } = payload;
        const orderPayload = gateway === 'adyen' ? payload : omit(payload, 'payment');

        return this._placeOrderService.submitOrder(orderPayload, options)
            .then(() =>
                this._placeOrderService.initializeOffsitePayment(payload.payment, payload.useStoreCredit, options)
            );
    }

    /**
     * @inheritdoc
     */
    finalize(options) {
        const { checkout } = this._store.getState();
        const { orderId, payment = {} } = checkout.getOrder();

        if (orderId &&
            payment.status === paymentStatusTypes.ACKNOWLEDGE ||
            payment.status === paymentStatusTypes.FINALIZE) {
            return this._placeOrderService.finalizeOrder(orderId, options);
        }

        return Promise.resolve(this._store.getState());
    }
}
