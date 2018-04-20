import { omit } from 'lodash';

import { CheckoutSelectors, CheckoutStore } from '../../checkout';
import { InvalidArgumentError, MissingDataError } from '../../common/error/errors';
import { OrderActionCreator, OrderRequestBody } from '../../order';
import PaymentActionCreator from '../payment-action-creator';
import { PaymentRequestOptions } from '../payment-request-options';
import * as paymentStatusTypes from '../payment-status-types';

import PaymentStrategy from './payment-strategy';

export default class OffsitePaymentStrategy extends PaymentStrategy {
    constructor(
        store: CheckoutStore,
        private _orderActionCreator: OrderActionCreator,
        private _paymentActionCreator: PaymentActionCreator
    ) {
        super(store);
    }

    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<CheckoutSelectors> {
        const { payment: { gateway = '' } = {} } = payload;
        const orderPayload = gateway === 'adyen' ? payload : omit(payload, 'payment');

        return this._store.dispatch(this._orderActionCreator.submitOrder(orderPayload, true, options))
            .then(() => {
                if (!payload.payment) {
                    throw new InvalidArgumentError('Unable to submit payment because "payload.payment" argument is not provided.');
                }

                return this._store.dispatch(this._paymentActionCreator.initializeOffsitePayment(payload.payment));
            });
    }

    finalize(options?: PaymentRequestOptions): Promise<CheckoutSelectors> {
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
