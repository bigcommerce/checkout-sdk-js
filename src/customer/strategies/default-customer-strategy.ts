import { CheckoutStore, InternalCheckoutSelectors } from '../../checkout';
import CustomerActionCreator from '../customer-action-creator';
import CustomerCredentials from '../customer-credentials';
import { CustomerRequestOptions } from '../customer-request-options';

import CustomerStrategy from './customer-strategy';

export default class DefaultCustomerStrategy extends CustomerStrategy {
    constructor(
        store: CheckoutStore,
        private _customerActionCreator: CustomerActionCreator
    ) {
        super(store);
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
}
