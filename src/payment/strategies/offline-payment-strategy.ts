import { pick } from 'lodash';

import { CheckoutSelectors, CheckoutStore } from '../../checkout';
import { OrderActionCreator, OrderRequestBody, PlaceOrderService } from '../../order';
import Payment from '../payment';

import PaymentStrategy from './payment-strategy';

export default class OfflinePaymentStrategy extends PaymentStrategy {
    constructor(
        store: CheckoutStore,
        placeOrderService: PlaceOrderService,
        private _orderActionCreator: OrderActionCreator
    ) {
        super(store, placeOrderService);
    }

    execute(payload: OrderRequestBody, options: any): Promise<CheckoutSelectors> {
        const action = this._orderActionCreator.submitOrder({
            ...payload,
            payment: pick(payload.payment, 'name') as Payment,
        }, true, options);

        return this._store.dispatch(action);
    }
}
