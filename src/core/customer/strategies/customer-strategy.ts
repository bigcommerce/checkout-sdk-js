import { CheckoutSelectors } from '../../checkout';
import { ReadableDataStore } from '../../../data-store';
import CustomerCredentials from '../customer-credentials';
import SignInCustomerService from '../sign-in-customer-service';

export default abstract class CustomerStrategy {
    protected _isInitialized: boolean;

    constructor(
        protected _store: ReadableDataStore<CheckoutSelectors>,
        protected _signInCustomerService: SignInCustomerService
    ) {}

    abstract signIn(credentials: CustomerCredentials, options?: any): Promise<CheckoutSelectors>;

    abstract signOut(options?: any): Promise<CheckoutSelectors>;

    initialize(options?: any): Promise<CheckoutSelectors> {
        this._isInitialized = true;

        return Promise.resolve(this._store.getState());
    }

    deinitialize(options?: any): Promise<CheckoutSelectors> {
        this._isInitialized = false;

        return Promise.resolve(this._store.getState());
    }
}
