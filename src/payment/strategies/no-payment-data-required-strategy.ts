import { omit } from 'lodash';

import { CheckoutSelectors } from '../../checkout';
import { OrderRequestBody } from '../../order';

import PaymentStrategy from './payment-strategy';

export default class NoPaymentDataRequiredPaymentStrategy extends PaymentStrategy {
    execute(orderRequest: OrderRequestBody, options?: any): Promise<CheckoutSelectors> {
        return this._placeOrderService.submitOrder(omit(orderRequest, 'payment'), true, options);
    }
}
