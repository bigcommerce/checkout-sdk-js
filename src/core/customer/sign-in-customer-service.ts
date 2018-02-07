import { CheckoutSelectors, CheckoutStore } from '../checkout';
import CustomerActionCreator from './customer-action-creator';
import CustomerCredentials from './customer-credentials';

export default class SignInCustomerService {
    constructor(
        private _store: CheckoutStore,
        private _customerActionCreator: CustomerActionCreator
    ) {}

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
