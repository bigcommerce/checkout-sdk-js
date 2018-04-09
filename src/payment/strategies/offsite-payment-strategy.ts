import { omit } from 'lodash';

import { CheckoutSelectors, CheckoutStore } from '../../checkout';
import { MissingDataError } from '../../common/error/errors';
import { OrderActionCreator, OrderRequestBody, PlaceOrderService } from '../../order';
import * as paymentStatusTypes from '../payment-status-types';

import PaymentStrategy from './payment-strategy';

export default class OffsitePaymentStrategy extends PaymentStrategy {
    constructor(
        store: CheckoutStore,
        placeOrderService: PlaceOrderService,
        private _orderActionCreator: OrderActionCreator
    ) {
        super(store, placeOrderService);
    }

    execute(payload: OrderRequestBody, options: any): Promise<CheckoutSelectors> {
        const { payment: { gateway = '' } = {} } = payload;
        const orderPayload = gateway === 'adyen' ? payload : omit(payload, 'payment');

        return this._store.dispatch(this._orderActionCreator.submitOrder(orderPayload, true, options))
            .then(() =>
                this._placeOrderService.initializeOffsitePayment(payload.payment, payload.useStoreCredit, options)
            );
    }

    finalize(options: any): Promise<CheckoutSelectors> {
        const { checkout } = this._store.getState();
        const order = checkout.getOrder();

        if (!order) {
            throw new MissingDataError('Unable to finalize order because "order" data is missing.');
        }

        const { orderId, payment = {} } = order;

        if (orderId &&
            payment.status === paymentStatusTypes.ACKNOWLEDGE ||
            payment.status === paymentStatusTypes.FINALIZE) {
            return this._store.dispatch(this._orderActionCreator.finalizeOrder(orderId, options));
        }

        return super.finalize();
    }
}
