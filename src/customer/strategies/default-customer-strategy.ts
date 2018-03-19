import { CheckoutSelectors, CheckoutStore } from '../../checkout';
import CustomerCredentials from '../customer-credentials';
import SignInCustomerService from '../sign-in-customer-service';
import CustomerStrategy from './customer-strategy';
import CustomerActionCreator from '../customer-action-creator';

export default class DefaultCustomerStrategy extends CustomerStrategy {
    constructor(
        store: CheckoutStore,
        signInCustomerService: SignInCustomerService,
        private _customerActionCreator: CustomerActionCreator
    ) {
        super(store, signInCustomerService);
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
