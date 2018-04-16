import { Address } from '../../address';
import { CheckoutSelectors, CheckoutStore } from '../../checkout';

export default abstract class ShippingStrategy {
    protected _isInitialized = false;

    constructor(
        protected _store: CheckoutStore
    ) {}

    abstract updateAddress(address: Address, options?: any): Promise<CheckoutSelectors>;

    abstract selectOption(addressId: string, optionId: string, options?: any): Promise<CheckoutSelectors>;

    initialize(options?: any): Promise<CheckoutSelectors> {
        this._isInitialized = true;

        return Promise.resolve(this._store.getState());
    }

    deinitialize(options?: any): Promise<CheckoutSelectors> {
        this._isInitialized = false;

        return Promise.resolve(this._store.getState());
    }
}
