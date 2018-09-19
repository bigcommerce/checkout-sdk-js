import { CheckoutStore, InternalCheckoutSelectors } from '../../checkout';
import { OrderActionCreator, OrderPaymentRequestBody, OrderRequestBody } from '../../order';
import { PaymentArgumentInvalidError } from '../errors';
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

    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { payment, ...order } = payload;
        const paymentData = payment && payment.paymentData;
        const orderPayload = this._shouldSubmitFullPayload(payment) ? payload : order;

        if (!payment || !paymentData) {
            throw new PaymentArgumentInvalidError(['payment.paymentData']);
        }

        return this._store.dispatch(this._orderActionCreator.submitOrder(orderPayload, options))
            .then(() =>
                this._store.dispatch(this._paymentActionCreator.initializeOffsitePayment({ ...payment, paymentData }))
            );
    }

    finalize(options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const state = this._store.getState();
        const order = state.order.getOrder();
        const status = state.payment.getPaymentStatus();

        if (order && (status === paymentStatusTypes.ACKNOWLEDGE || status === paymentStatusTypes.FINALIZE)) {
            return this._store.dispatch(this._orderActionCreator.finalizeOrder(order.orderId, options));
        }

        return super.finalize();
    }

    private _shouldSubmitFullPayload(payment?: OrderPaymentRequestBody): boolean {
        // FIXME: A temporary workaround to support offsite payment methods
        // where their return URL needs to be provided by the core app.
        if (!payment) {
            return false;
        }

        return payment.gatewayId === 'adyen' || payment.methodId === 'ccavenuemars';
    }
}
