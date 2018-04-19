import { CheckoutSelectors, CheckoutStore } from '../../checkout';
import { OrderRequestBody } from '../../order';
import { OrderFinalizationNotRequiredError } from '../../order/errors';
import PaymentMethod from '../payment-method';

export default abstract class PaymentStrategy {
    protected _isInitialized = false;
    protected _paymentMethod?: PaymentMethod;

    constructor(
        protected _store: CheckoutStore
    ) {}

    abstract execute(payload: OrderRequestBody, options?: any): Promise<CheckoutSelectors>;

    finalize(options?: any): Promise<CheckoutSelectors> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    initialize(options: InitializeOptions): Promise<CheckoutSelectors> {
        this._isInitialized = true;
        this._paymentMethod = options.paymentMethod;

        return Promise.resolve(this._store.getState());
    }

    deinitialize(options?: any): Promise<CheckoutSelectors> {
        this._isInitialized = false;
        this._paymentMethod = undefined;

        return Promise.resolve(this._store.getState());
    }
}

export interface InitializeOptions {
    paymentMethod: PaymentMethod;
}
