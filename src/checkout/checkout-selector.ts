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

    isPaymentDataRequired(useStoreCredit: boolean = false): boolean {
        const grandTotal = this._checkout.data && this._checkout.data.grandTotal || 0;
        const storeCredit = this._checkout.data && this._checkout.data.customer.storeCredit || 0;

        return (useStoreCredit ? grandTotal - storeCredit : grandTotal) > 0;
    }

    isLoading(): boolean {
        return this._checkout.statuses.isLoading === true;
    }
}
