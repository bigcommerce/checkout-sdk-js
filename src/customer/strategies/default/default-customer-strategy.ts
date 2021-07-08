import { BillingAddressActionCreator } from '../../../billing';
import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import CustomerAccountRequestBody from '../../customer-account';
import CustomerActionCreator from '../../customer-action-creator';
import CustomerCredentials from '../../customer-credentials';
import { CustomerRequestOptions } from '../../customer-request-options';
import { GuestCredentials } from '../../guest-credentials';
import CustomerStrategy from '../customer-strategy';

export default class DefaultCustomerStrategy implements CustomerStrategy {
    constructor(
        private _store: CheckoutStore,
        private _billingAddressActionCreator: BillingAddressActionCreator,
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

    signUp(customerAccount: CustomerAccountRequestBody, options?: CustomerRequestOptions): Promise<InternalCheckoutSelectors> {
        return this._store.dispatch(
            this._customerActionCreator.createCustomer(customerAccount, options)
        );
    }

    continueAsGuest(credentials: GuestCredentials, options?: CustomerRequestOptions): Promise<InternalCheckoutSelectors> {
        return this._store.dispatch(
            this._billingAddressActionCreator.continueAsGuest(credentials, options)
        );
    }
}
