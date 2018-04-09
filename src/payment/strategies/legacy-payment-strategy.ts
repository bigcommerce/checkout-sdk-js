import { CheckoutSelectors, CheckoutStore } from '../../checkout';
import { OrderActionCreator, OrderRequestBody, PlaceOrderService } from '../../order';

import PaymentStrategy from './payment-strategy';

export default class LegacyPaymentStrategy extends PaymentStrategy {
    constructor(
        store: CheckoutStore,
        placeOrderService: PlaceOrderService,
        private _orderActionCreator: OrderActionCreator
    ) {
        super(store, placeOrderService);
    }

    execute(payload: OrderRequestBody, options: any): Promise<CheckoutSelectors> {
        return this._store.dispatch(this._orderActionCreator.submitOrder(payload, true, options));
    }
}
