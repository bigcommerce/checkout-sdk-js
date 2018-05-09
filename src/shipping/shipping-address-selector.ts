import { selector } from '../common/selector';

import { InternalAddress } from '../address';

/**
 * @todo Convert this file into TypeScript properly
 */
@selector
export default class ShippingAddressSelector {
    constructor(
        private _quote: any = {}
    ) {}

    getShippingAddress(): InternalAddress | undefined {
        return this._quote.data && this._quote.data.shippingAddress;
    }
}
