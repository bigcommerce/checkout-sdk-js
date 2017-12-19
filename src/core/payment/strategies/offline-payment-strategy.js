import { pick } from 'lodash';
import PaymentStrategy from './payment-strategy';

export default class OfflinePaymentStrategy extends PaymentStrategy {
    /**
     * @inheritdoc
     */
    execute(payload, options) {
        return this._placeOrderService.submitOrder({
            ...payload,
            payment: pick(payload.payment, 'name'),
        }, options);
    }
}
