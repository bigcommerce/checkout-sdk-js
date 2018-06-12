import { selector } from '../common/selector';

import Checkout from './checkout';
import CheckoutState from './checkout-state';

@selector
export default class CheckoutSelector {
    constructor(
        private _checkout: CheckoutState
    ) {}

    getCheckout(): Checkout | undefined {
        return this._checkout.data;
    }

    getLoadError(): Error | undefined {
        return this._checkout.errors.loadError;
    }

    isLoading(): boolean {
        return this._checkout.statuses.isLoading === true;
    }
}
