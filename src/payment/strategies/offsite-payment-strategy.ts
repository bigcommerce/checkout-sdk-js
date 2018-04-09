import { omit } from 'lodash';

import { CheckoutSelectors } from '../../checkout';
import { OrderRequestBody } from '../../order';
import * as paymentStatusTypes from '../payment-status-types';

import PaymentStrategy from './payment-strategy';

export default class OffsitePaymentStrategy extends PaymentStrategy {
    execute(payload: OrderRequestBody, options: any): Promise<CheckoutSelectors> {
        const { payment: { gateway = '' } } = payload;
        const orderPayload = gateway === 'adyen' ? payload : omit(payload, 'payment');

        return this._placeOrderService.submitOrder(orderPayload, options)
            .then(() =>
                this._placeOrderService.initializeOffsitePayment(payload.payment, payload.useStoreCredit, options)
            );
    }

    finalize(options: any): Promise<CheckoutSelectors> {
        const { checkout } = this._store.getState();
        const { orderId, payment = {} } = checkout.getOrder()!;

        if (orderId &&
            payment.status === paymentStatusTypes.ACKNOWLEDGE ||
            payment.status === paymentStatusTypes.FINALIZE) {
            return this._placeOrderService.finalizeOrder(orderId, options);
        }

        return super.finalize();
    }
}
