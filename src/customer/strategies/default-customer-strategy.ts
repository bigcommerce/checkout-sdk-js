import { CheckoutStore, InternalCheckoutSelectors } from '../../checkout';
import CustomerActionCreator from '../customer-action-creator';
import CustomerCredentials from '../customer-credentials';
import { CustomerInitializeOptions, CustomerRequestOptions } from '../customer-request-options';

import CustomerStrategy from './customer-strategy';

export default class DefaultCustomerStrategy implements CustomerStrategy {
    constructor(
        private _store: CheckoutStore,
        private _customerActionCreator: CustomerActionCreator
    ) {}

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

    initialize(options?: CustomerInitializeOptions): Promise<InternalCheckoutSelectors> {
        return Promise.resolve(this._store.getState());
    }

    deinitialize(options?: CustomerRequestOptions): Promise<InternalCheckoutSelectors> {
        return Promise.resolve(this._store.getState());
    }
}
