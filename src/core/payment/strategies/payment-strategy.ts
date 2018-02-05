import { CheckoutSelectors } from '../../checkout';
import { OrderFinalizationNotRequiredError } from '../../order/errors';
import { OrderRequestBody } from '../../order';
import { ReadableDataStore } from '../../../data-store';
import PaymentMethod from '../payment-method';

export default abstract class PaymentStrategy {
    constructor(
        protected _paymentMethod: PaymentMethod,
        protected _store: ReadableDataStore<CheckoutSelectors>,
        protected _placeOrderService: any
    ) {}

    abstract execute(payload: OrderRequestBody, options: any): Promise<CheckoutSelectors>;

    finalize(options: any): Promise<CheckoutSelectors> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    initialize(options: any): Promise<CheckoutSelectors> {
        return Promise.resolve(this._store.getState());
    }

    deinitialize(options: any): Promise<CheckoutSelectors> {
        return Promise.resolve(this._store.getState());
    }
}
