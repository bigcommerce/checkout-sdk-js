import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { OrderActionCreator, OrderPaymentRequestBody, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { PaymentArgumentInvalidError } from '../../errors';
import { HostedInstrument, VaultedInstrument } from '../../payment';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentRequestOptions } from '../../payment-request-options';
import * as paymentStatusTypes from '../../payment-status-types';
import PaymentStrategy from '../payment-strategy';

export default class OffsitePaymentStrategy implements PaymentStrategy {
    constructor(
        private _store: CheckoutStore,
        private _orderActionCreator: OrderActionCreator,
        private _paymentActionCreator: PaymentActionCreator
    ) {}

    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { payment, ...order } = payload;
        const orderPayload = this._shouldSubmitFullPayload(payment) ? payload : order;
        const paymentData = payment && payment.paymentData;
        const instrumentId = paymentData && (paymentData as VaultedInstrument).instrumentId || undefined;
        const shouldSaveInstrument = paymentData && (paymentData as HostedInstrument).shouldSaveInstrument || undefined;
        const shouldSetAsDefaultInstrument = paymentData && (paymentData as HostedInstrument).shouldSetAsDefaultInstrument || undefined;

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        const { methodId, gatewayId } = payment;

        return this._store.dispatch(this._orderActionCreator.submitOrder(orderPayload, options))
            .then(() =>
            this._store.dispatch(this._paymentActionCreator.initializeOffsitePayment({
                    methodId,
                    gatewayId,
                    instrumentId,
                    shouldSaveInstrument,
                    shouldSetAsDefaultInstrument,
                }))
            );
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

    private _shouldSubmitFullPayload(payment?: OrderPaymentRequestBody): boolean {
        // FIXME: A temporary workaround to support offsite payment methods
        // where their return URL needs to be provided by the core app.
        if (!payment) {
            return false;
        }

        return payment.gatewayId === 'adyen' || payment.gatewayId === 'barclaycard' || payment.methodId === 'ccavenuemars';
    }
}
