import { CheckoutStore, InternalCheckoutSelectors } from '../../checkout';
import { NotImplementedError} from '../../common/error/errors';
import { RemoteCheckoutActionCreator } from '../../remote-checkout';
import CustomerCredentials from '../customer-credentials';
import { CustomerRequestOptions } from '../customer-request-options';

import CustomerStrategy from './customer-strategy';

export default class SquareCustomerStrategy extends CustomerStrategy {

    constructor(
        store: CheckoutStore,
        private _remoteCheckoutActionCreator: RemoteCheckoutActionCreator
    ) {
        super(store);
    }

    signIn(credentials: CustomerCredentials, options?: CustomerRequestOptions): Promise<InternalCheckoutSelectors> {
        throw new NotImplementedError(
            'In order to sign in via Masterpass, the shopper must click on "Masterpass" button.'
        );
    }

    signOut(options?: any): Promise<InternalCheckoutSelectors> {
        const state = this._store.getState();
        const payment = state.payment.getPaymentId();

        if (!payment) {
            return Promise.resolve(this._store.getState());
        }

        return this._store.dispatch(
            this._remoteCheckoutActionCreator.signOut(payment.providerId, options)
        );
    }
}
