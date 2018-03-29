export default class ShippingAddressSelector {
    /**
     * @constructor
     * @param {QuoteState} quote
     */
    constructor(quote = {}) {
        this._quote = quote;
    }

    /**
     * @return {Address}
     */
    getShippingAddress() {
        return this._quote.data && this._quote.data.shippingAddress;
    }
}
