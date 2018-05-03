import { omit } from 'lodash';

import { CheckoutStore, InternalCheckoutSelectors } from '../../checkout';
import { OrderActionCreator, OrderRequestBody } from '../../order';
import { PaymentRequestOptions } from '../payment-request-options';

import PaymentStrategy from './payment-strategy';

export default class NoPaymentDataRequiredPaymentStrategy extends PaymentStrategy {
    constructor(
        store: CheckoutStore,
        private _orderActionCreator: OrderActionCreator
    ) {
        super(store);
    }

    execute(orderRequest: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        return this._store.dispatch(
            this._orderActionCreator.submitOrder(omit(orderRequest, 'payment'), true, options)
        );
    }
}
