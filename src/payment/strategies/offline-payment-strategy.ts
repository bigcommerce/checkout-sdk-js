import { pick } from 'lodash';

import { CheckoutStore, InternalCheckoutSelectors } from '../../checkout';
import { OrderActionCreator, OrderRequestBody } from '../../order';
import Payment from '../payment';
import { PaymentRequestOptions } from '../payment-request-options';

import PaymentStrategy from './payment-strategy';

export default class OfflinePaymentStrategy extends PaymentStrategy {
    constructor(
        store: CheckoutStore,
        private _orderActionCreator: OrderActionCreator
    ) {
        super(store);
    }

    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const action = this._orderActionCreator.submitOrder({
            ...payload,
            payment: pick(payload.payment, 'name') as Payment,
        }, options);

        return this._store.dispatch(action);
    }
}
