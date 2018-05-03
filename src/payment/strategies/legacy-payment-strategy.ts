import { CheckoutStore, InternalCheckoutSelectors } from '../../checkout';
import { OrderActionCreator, OrderRequestBody } from '../../order';
import { PaymentRequestOptions } from '../payment-request-options';

import PaymentStrategy from './payment-strategy';

export default class LegacyPaymentStrategy extends PaymentStrategy {
    constructor(
        store: CheckoutStore,
        private _orderActionCreator: OrderActionCreator
    ) {
        super(store);
    }

    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        return this._store.dispatch(this._orderActionCreator.submitOrder(payload, true, options));
    }
}
