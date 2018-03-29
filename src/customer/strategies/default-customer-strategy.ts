import { CheckoutSelectors, CheckoutStore } from '../../checkout';
import CustomerActionCreator from '../customer-action-creator';
import CustomerCredentials from '../customer-credentials';

import CustomerStrategy from './customer-strategy';

export default class DefaultCustomerStrategy extends CustomerStrategy {
    constructor(
        store: CheckoutStore,
        private _customerActionCreator: CustomerActionCreator
    ) {
        super(store);
    }

    signIn(credentials: CustomerCredentials, options?: any): Promise<CheckoutSelectors> {
        return this._store.dispatch(
            this._customerActionCreator.signInCustomer(credentials, options)
        );
    }

    signOut(options?: any): Promise<CheckoutSelectors> {
        return this._store.dispatch(
            this._customerActionCreator.signOutCustomer(options)
        );
    }
}
