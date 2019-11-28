import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { OrderActionCreator,  OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { PaymentArgumentInvalidError } from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentRequestOptions } from '../../payment-request-options';
import * as paymentStatusTypes from '../../payment-status-types';
import PaymentStrategy from '../payment-strategy';

export default class BarclaycardPaymentStrategy implements PaymentStrategy {
    constructor(
        private _store: CheckoutStore,
        private _orderActionCreator: OrderActionCreator,
        private _paymentActionCreator: PaymentActionCreator
    ) { }

    async execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { payment } = payload;
        const paymentData = payment && payment.paymentData;

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        await this._store.dispatch(this._orderActionCreator.submitOrder(payload, options));

        return await this._store.dispatch(this._paymentActionCreator.initializeOffsitePayment(
            payment.methodId,
            payment.gatewayId,
            paymentData));
    }

    finalize(options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const state = this._store.getState();
        const order = state.order.getOrder();
        const status = state.payment.getPaymentStatus();

        if (order && (status === paymentStatusTypes.ACKNOWLEDGE || status === paymentStatusTypes.FINALIZE)) {
            return this._store.dispatch(this._orderActionCreator.finalizeOrder(order.orderId, options));
        }

        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    initialize(): Promise<InternalCheckoutSelectors> {
        return Promise.resolve(this._store.getState());
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
        return Promise.resolve(this._store.getState());
    }
}
