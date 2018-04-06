import { CheckoutSelectors } from '../../checkout';
import { OrderRequestBody } from '../../order';

import PaymentStrategy from './payment-strategy';

export default class LegacyPaymentStrategy extends PaymentStrategy {
    execute(payload: OrderRequestBody, options: any): Promise<CheckoutSelectors> {
        return this._placeOrderService.submitOrder(payload, options);
    }
}
