export default class BillingAddressSelector {
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
    getBillingAddress() {
        return this._quote.data.billingAddress;
    }

    /**
     * @return {?ErrorResponse}
     */
    getUpdateError() {
        return this._quote.errors &&
            this._quote.errors.updateBillingAddressError;
    }

    /**
     * @return {boolean}
     */
    isUpdating() {
        return !!(this._quote.statuses &&
            this._quote.statuses.isUpdatingBillingAddress);
    }
}
