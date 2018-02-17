import { CheckoutSelectors } from '../../checkout';
import { OrderFinalizationNotRequiredError } from '../../order/errors';
import { OrderRequestBody } from '../../order';
import { ReadableDataStore } from '../../../data-store';
import PaymentMethod from '../payment-method';

export default abstract class PaymentStrategy {
    protected _isInitialized = false;
    protected _paymentMethod?: PaymentMethod;

    constructor(
        protected _store: ReadableDataStore<CheckoutSelectors>,
        protected _placeOrderService: any
    ) {}

    abstract execute(payload: OrderRequestBody, options: any): Promise<CheckoutSelectors>;

    finalize(options: any): Promise<CheckoutSelectors> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    initialize(options: InitializeOptions): Promise<CheckoutSelectors> {
        this._isInitialized = true;
        this._paymentMethod = options.paymentMethod;

        return Promise.resolve(this._store.getState());
    }

    deinitialize(options: any): Promise<CheckoutSelectors> {
        this._isInitialized = false;
        this._paymentMethod = undefined;

        return Promise.resolve(this._store.getState());
    }
}

export interface InitializeOptions {
    paymentMethod: PaymentMethod;
}
