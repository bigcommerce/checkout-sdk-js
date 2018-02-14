import { CheckoutSelectors, CheckoutStore } from '../checkout';
import { RemoteCheckoutActionCreator } from '../remote-checkout';
import CustomerActionCreator from './customer-action-creator';
import CustomerCredentials from './customer-credentials';

export default class SignInCustomerService {
    constructor(
        private _store: CheckoutStore,
        private _customerActionCreator: CustomerActionCreator,
        private _remoteCheckoutActionCreator: RemoteCheckoutActionCreator
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

    remoteSignOut(methodName: string, options?: any): Promise<CheckoutSelectors> {
        return this._store.dispatch(
            this._remoteCheckoutActionCreator.signOut(methodName, options)
        );
    }
}
