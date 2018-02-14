import { Address } from '../../address';
import { CheckoutSelectors } from '../../checkout';
import { ReadableDataStore } from '../../../data-store';
import UpdateShippingService from '../update-shipping-service';

export default abstract class ShippingStrategy {
    protected _isInitialized: boolean;

    constructor(
        protected _store: ReadableDataStore<CheckoutSelectors>,
        protected _updateShippingService: UpdateShippingService
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
