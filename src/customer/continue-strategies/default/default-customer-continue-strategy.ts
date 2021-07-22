import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { CustomerContinueOptions } from '../../customer-continue-request-options';
import CustomerContinueStrategy from '../customer-continue-strategy';

export default class DefaultCustomerContinueStrategy implements CustomerContinueStrategy {
    constructor(
        private _store: CheckoutStore
    ) { }

    initialize(): Promise<InternalCheckoutSelectors> {
        console.log('DEFAULT initialize');

        return Promise.resolve(this._store.getState());
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
        console.log('DEFAULT deinitialize');

        return Promise.resolve(this._store.getState());
    }

    executeBeforeSignIn(options: CustomerContinueOptions): Promise<InternalCheckoutSelectors> {
        console.log('DEFAULT customSignIn');

        return Promise.resolve(options.fallback()).then(() => this._store.getState());
    }

    executeBeforeSignUp(options: CustomerContinueOptions): Promise<InternalCheckoutSelectors> {
        console.log('DEFAULT customSignIn');

        return Promise.resolve(options.fallback()).then(() => this._store.getState());
    }

    executeBeforeContinueAsGuest(options: CustomerContinueOptions): Promise<InternalCheckoutSelectors> {
        console.log('DEFAULT customContinueAsGuest');

        options.fallback();

        return Promise.resolve(options.fallback()).then(() => this._store.getState());
    }
}
