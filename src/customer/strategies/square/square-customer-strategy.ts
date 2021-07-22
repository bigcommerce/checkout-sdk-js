import { BillingAddressActionCreator } from '../../../billing';
import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { NotImplementedError } from '../../../common/error/errors';
import { RemoteCheckoutActionCreator } from '../../../remote-checkout';
import CustomerAccountRequestBody from '../../customer-account';
import CustomerActionCreator from '../../customer-action-creator';
import { CustomerRequestOptions } from '../../customer-request-options';
import { GuestCredentials } from '../../guest-credentials';
import CustomerStrategy from '../customer-strategy';

export default class SquareCustomerStrategy implements CustomerStrategy {

    constructor(
        private _store: CheckoutStore,
        private _remoteCheckoutActionCreator: RemoteCheckoutActionCreator,
        private _billingAddressActionCreator: BillingAddressActionCreator,
        private _customerActionCreator: CustomerActionCreator
    ) {}

    signIn(): Promise<InternalCheckoutSelectors> {
        throw new NotImplementedError(
            'In order to sign in via Masterpass, the shopper must click on "Masterpass" button.'
        );
    }

    signOut(options?: CustomerRequestOptions): Promise<InternalCheckoutSelectors> {
        const state = this._store.getState();
        const payment = state.payment.getPaymentId();

        if (!payment) {
            return Promise.resolve(this._store.getState());
        }

        return this._store.dispatch(
            this._remoteCheckoutActionCreator.signOut(payment.providerId, options)
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

    initialize(): Promise<InternalCheckoutSelectors> {
        return Promise.resolve(this._store.getState());
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
        return Promise.resolve(this._store.getState());
    }
}
