import { CheckoutSelectors, CheckoutStore } from '../../checkout';
import { OrderRequestBody } from '../../order';
import { OrderFinalizationNotRequiredError } from '../../order/errors';
import PaymentMethod from '../payment-method';

import { PaymentInitializeOptions, PaymentRequestOptions } from '../payment-request-options';

export default abstract class PaymentStrategy {
    protected _isInitialized = false;
    protected _paymentMethod?: PaymentMethod;

    constructor(
        protected _store: CheckoutStore
    ) {}

    abstract execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<CheckoutSelectors>;

    finalize(options?: PaymentRequestOptions): Promise<CheckoutSelectors> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    initialize(options?: PaymentInitializeOptions): Promise<CheckoutSelectors> {
        this._isInitialized = true;
        this._paymentMethod = options && options.paymentMethod;

        return Promise.resolve(this._store.getState());
    }

    deinitialize(options?: PaymentRequestOptions): Promise<CheckoutSelectors> {
        this._isInitialized = false;
        this._paymentMethod = undefined;

        return Promise.resolve(this._store.getState());
    }
}
