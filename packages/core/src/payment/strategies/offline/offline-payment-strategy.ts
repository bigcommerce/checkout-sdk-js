import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

export default class OfflinePaymentStrategy implements PaymentStrategy {
    constructor(
        private _store: CheckoutStore,
        private _orderActionCreator: OrderActionCreator
    ) {}

    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const action = this._orderActionCreator.submitOrder({
            ...payload,
            payment: payload.payment ? { methodId: payload.payment.methodId } : undefined,
        }, options);

        return this._store.dispatch(action);
    }

    finalize(): Promise<InternalCheckoutSelectors> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    initialize(): Promise<InternalCheckoutSelectors> {
        return Promise.resolve(this._store.getState());
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
        return Promise.resolve(this._store.getState());
    }
}
