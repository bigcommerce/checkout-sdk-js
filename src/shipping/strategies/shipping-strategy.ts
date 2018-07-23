import { AddressRequestBody } from '../../address';
import { CheckoutStore, InternalCheckoutSelectors } from '../../checkout';

import { ShippingRequestOptions } from '../shipping-request-options';

export default abstract class ShippingStrategy {
    protected _isInitialized = false;

    constructor(
        protected _store: CheckoutStore
    ) {}

    abstract updateAddress(address: AddressRequestBody, options?: ShippingRequestOptions): Promise<InternalCheckoutSelectors>;

    abstract selectOption(optionId: string, options?: ShippingRequestOptions): Promise<InternalCheckoutSelectors>;

    initialize(options?: ShippingRequestOptions): Promise<InternalCheckoutSelectors> {
        this._isInitialized = true;

        return Promise.resolve(this._store.getState());
    }

    deinitialize(options?: ShippingRequestOptions): Promise<InternalCheckoutSelectors> {
        this._isInitialized = false;

        return Promise.resolve(this._store.getState());
    }
}
