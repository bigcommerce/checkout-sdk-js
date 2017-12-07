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
        return this._quote.data.shippingAddress;
    }

    /**
     * @return {?ErrorResponse}
     */
    getUpdateError() {
        return this._quote.errors &&
            this._quote.errors.updateShippingAddressError;
    }

    /**
     * @return {boolean}
     */
    isUpdating() {
        return !!(this._quote.statuses &&
            this._quote.statuses.isUpdatingShippingAddress);
    }
}
