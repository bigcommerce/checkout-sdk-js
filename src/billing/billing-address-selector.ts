import { InternalAddress } from '../address';

/**
 * @todo Convert this file into TypeScript properly
 */
export default class BillingAddressSelector {
    constructor(
        private _quote: any = {}
    ) {}

    getBillingAddress(): InternalAddress | undefined {
        return this._quote.data && this._quote.data.billingAddress;
    }

    getUpdateError(): Error | undefined {
        return this._quote.errors && this._quote.errors.updateBillingAddressError;
    }

    isUpdating(): boolean {
        return !!(this._quote.statuses && this._quote.statuses.isUpdatingBillingAddress);
    }
}
