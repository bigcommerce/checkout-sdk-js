import { selector } from '../common/selector';

import { InternalAddress } from '../address';
import { QuoteState } from '../quote';

@selector
export default class ShippingAddressSelector {
    constructor(
        private _quote: QuoteState
    ) {}

    getShippingAddress(): InternalAddress | undefined {
        return this._quote.data && this._quote.data.shippingAddress;
    }
}
