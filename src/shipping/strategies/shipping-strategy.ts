import { Address } from '../../address';
import { CheckoutSelectors, CheckoutStore } from '../../checkout';

import { ShippingRequestOptions } from '../shipping-request-options';

export default abstract class ShippingStrategy {
    protected _isInitialized = false;

    constructor(
        protected _store: CheckoutStore
    ) {}

    abstract updateAddress(address: Address, options?: ShippingRequestOptions): Promise<CheckoutSelectors>;

    abstract selectOption(optionId: string, options?: ShippingRequestOptions): Promise<CheckoutSelectors>;

    initialize(options?: ShippingRequestOptions): Promise<CheckoutSelectors> {
        this._isInitialized = true;

        return Promise.resolve(this._store.getState());
    }

    deinitialize(options?: ShippingRequestOptions): Promise<CheckoutSelectors> {
        this._isInitialized = false;

        return Promise.resolve(this._store.getState());
    }
}
