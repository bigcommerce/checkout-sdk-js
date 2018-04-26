import { Address } from '../../address';
import { CheckoutSelectors, CheckoutStore } from '../../checkout';
import { ShippingActionOptions } from '../shipping-strategy-action-creator';

export default abstract class ShippingStrategy {
    protected _isInitialized = false;

    constructor(
        protected _store: CheckoutStore
    ) {}

    abstract updateAddress(address: Address, options?: ShippingActionOptions): Promise<CheckoutSelectors>;

    abstract selectOption(optionId: string, options?: ShippingActionOptions): Promise<CheckoutSelectors>;

    initialize(options?: any): Promise<CheckoutSelectors> {
        this._isInitialized = true;

        return Promise.resolve(this._store.getState());
    }

    deinitialize(options?: any): Promise<CheckoutSelectors> {
        this._isInitialized = false;

        return Promise.resolve(this._store.getState());
    }
}
