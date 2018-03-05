import { omit } from 'lodash';
import { CheckoutSelectors } from '../../checkout';
import { OrderRequestBody } from '../../order';
import PaymentStrategy from './payment-strategy';

export default class CreditCardPaymentStrategy extends PaymentStrategy {
    execute(payload: OrderRequestBody, options?: any): Promise<CheckoutSelectors> {
        return this._placeOrderService.submitOrder(omit(payload, 'payment'), options)
            .then(() =>
                this._placeOrderService.submitPayment(payload.payment, payload.useStoreCredit, options)
            );
    }
}
