import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { NotImplementedError } from '../../../common/error/errors';
import { RemoteCheckoutActionCreator } from '../../../remote-checkout';
import { CustomerRequestOptions } from '../../customer-request-options';
import CustomerStrategy from '../customer-strategy';

export default class SquareCustomerStrategy implements CustomerStrategy {

    constructor(
        private _store: CheckoutStore,
        private _remoteCheckoutActionCreator: RemoteCheckoutActionCreator
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

    initialize(): Promise<InternalCheckoutSelectors> {
        return Promise.resolve(this._store.getState());
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
        return Promise.resolve(this._store.getState());
    }
}
