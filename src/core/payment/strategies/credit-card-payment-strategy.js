import { omit } from 'lodash';
import PaymentStrategy from './payment-strategy';

export default class CreditCardPaymentStrategy extends PaymentStrategy {
    /**
     * @inheritdoc
     */
    execute(payload, options) {
        return this._placeOrderService.submitOrder(omit(payload, 'payment'), options)
            .then(() =>
                this._placeOrderService.submitPayment(payload.payment, payload.useStoreCredit, options)
            );
    }
}
