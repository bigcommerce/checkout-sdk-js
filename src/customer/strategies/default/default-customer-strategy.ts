import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import CustomerActionCreator from '../../customer-action-creator';
import CustomerCredentials from '../../customer-credentials';
import { CustomerContinueOptions, CustomerRequestOptions } from '../../customer-request-options';
import CustomerStrategy from '../customer-strategy';

export default class DefaultCustomerStrategy implements CustomerStrategy {
    constructor(
        private _store: CheckoutStore,
        private _customerActionCreator: CustomerActionCreator
    ) {}

    initialize(): Promise<InternalCheckoutSelectors> {
        return Promise.resolve(this._store.getState());
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
        return Promise.resolve(this._store.getState());
    }

    signIn(credentials: CustomerCredentials, options?: CustomerRequestOptions): Promise<InternalCheckoutSelectors> {
        return this._store.dispatch(
            this._customerActionCreator.signInCustomer(credentials, options)
        );
    }

    signOut(options?: CustomerRequestOptions): Promise<InternalCheckoutSelectors> {
        return this._store.dispatch(
            this._customerActionCreator.signOutCustomer(options)
        );
    }

    customerContinue(options?: CustomerContinueOptions): Promise<InternalCheckoutSelectors> {
        if (options?.fallback) {
            options.fallback();
        }

        return Promise.resolve(this._store.getState());
    }
}
