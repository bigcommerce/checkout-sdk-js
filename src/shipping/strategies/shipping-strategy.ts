import { InternalAddress } from '../../address';
import { CheckoutSelectors, CheckoutStore } from '../../checkout';
import UpdateShippingService from '../update-shipping-service';

export default abstract class ShippingStrategy {
    protected _isInitialized = false;

    constructor(
        protected _store: CheckoutStore,
        protected _updateShippingService: UpdateShippingService
    ) {}

    abstract updateAddress(address: InternalAddress, options?: any): Promise<CheckoutSelectors>;

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
