import { omit } from 'lodash';

import { CheckoutSelectors } from '../../checkout';
import { OrderRequestBody } from '../../order';
import PaymentStrategy from './payment-strategy';

export default class NoPaymentRequiredPaymentStrategy extends PaymentStrategy {
    execute(orderRequest: OrderRequestBody, options?: any): Promise<CheckoutSelectors> {
        const { useStoreCredit } = orderRequest;
        return this._placeOrderService.submitOrder(omit(orderRequest, 'payment'), useStoreCredit, options);
    }
}
