import { InternalAddress } from '../address';
import { selector } from '../common/selector';

import { QuoteState } from '../quote';

@selector
export default class BillingAddressSelector {
    constructor(
        private _quote: QuoteState
    ) {}

    getBillingAddress(): InternalAddress | undefined {
        return this._quote.data && this._quote.data.billingAddress;
    }

    getUpdateError(): Error | undefined {
        return this._quote.errors.updateBillingAddressError;
    }

    isUpdating(): boolean {
        return !!this._quote.statuses.isUpdatingBillingAddress;
    }
}
