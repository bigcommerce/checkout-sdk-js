import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

export default class LegacyPaymentStrategy implements PaymentStrategy {
    constructor(
        private _store: CheckoutStore,
        private _orderActionCreator: OrderActionCreator
    ) {}

    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        return this._store.dispatch(this._orderActionCreator.submitOrder(payload, options));
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
