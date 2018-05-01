import { CheckoutSelectors, CheckoutStore } from '../../checkout';
import CustomerCredentials from '../customer-credentials';

import { CustomerInitializeOptions, CustomerRequestOptions } from '../customer-request-options';

export default abstract class CustomerStrategy {
    protected _isInitialized = false;

    constructor(
        protected _store: CheckoutStore
    ) {}

    abstract signIn(credentials: CustomerCredentials, options?: CustomerRequestOptions): Promise<CheckoutSelectors>;

    abstract signOut(options?: CustomerRequestOptions): Promise<CheckoutSelectors>;

    initialize(options?: CustomerInitializeOptions): Promise<CheckoutSelectors> {
        this._isInitialized = true;

        return Promise.resolve(this._store.getState());
    }

    deinitialize(options?: CustomerRequestOptions): Promise<CheckoutSelectors> {
        this._isInitialized = false;

        return Promise.resolve(this._store.getState());
    }
}
