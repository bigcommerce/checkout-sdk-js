import PaymentStrategy from './payment-strategy';

export default class LegacyPaymentStrategy extends PaymentStrategy {
    /**
     * @inheritdoc
     */
    execute(payload, options) {
        return this._placeOrderService.submitOrder(payload, options);
    }
}
