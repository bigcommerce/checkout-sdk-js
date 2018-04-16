import { CheckoutSelectors, CheckoutStore } from '../checkout';
import { MissingDataError } from '../common/error/errors';
import { RequestOptions } from '../common/http-request';
import { Payment, PaymentActionCreator } from '../payment';

import OrderActionCreator from './order-action-creator';

/**
 * @todo Convert this file into TypeScript properly
 */
export default class PlaceOrderService {
    constructor(
        private _store: CheckoutStore,
        private _orderActionCreator: OrderActionCreator,
        private _paymentActionCreator: PaymentActionCreator
    ) {}

    submitPayment(payment: Payment, options?: RequestOptions): Promise<CheckoutSelectors> {
        return this._store.dispatch(this._paymentActionCreator.submitPayment(payment))
            .then(({ checkout }) => {
                const order = checkout.getOrder();

                if (!order) {
                    throw new MissingDataError('Unable to refresh order data because "order" data is missing');
                }

                return this._store.dispatch(this._orderActionCreator.loadOrder(order.orderId, options));
            });
    }

    initializeOffsitePayment(payment: Payment): Promise<CheckoutSelectors> {
        return this._store.dispatch(this._paymentActionCreator.initializeOffsitePayment(payment));
    }
}
