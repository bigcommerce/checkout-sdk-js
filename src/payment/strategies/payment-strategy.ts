import { CheckoutStore, InternalCheckoutSelectors } from '../../checkout';
import { OrderRequestBody } from '../../order';
import { OrderFinalizationNotRequiredError } from '../../order/errors';

import { PaymentInitializeOptions, PaymentRequestOptions } from '../payment-request-options';

export default abstract class PaymentStrategy {
    protected _isInitialized = false;

    constructor(
        protected _store: CheckoutStore
    ) {}

    abstract execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors>;

    finalize(options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    initialize(options?: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        this._isInitialized = true;

        return Promise.resolve(this._store.getState());
    }

    deinitialize(options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        this._isInitialized = false;

        return Promise.resolve(this._store.getState());
    }
}
