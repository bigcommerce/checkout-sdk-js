export default class QuoteSelector {
    /**
     * @constructor
     * @param {QuoteState} quote
     */
    constructor(quote = {}) {
        this._quote = quote;
    }

    /**
     * @return {InternalQuote}
     */
    getQuote() {
        return this._quote.data;
    }

    /**
     * @return {QuoteMeta}
     */
    getQuoteMeta() {
        return this._quote.meta;
    }

    /**
     * @return {?ErrorResponse}
     */
    getLoadError() {
        return this._quote.errors && this._quote.errors.loadError;
    }

    /**
     * @return {boolean}
     */
    isLoading() {
        return !!(this._quote.statuses && this._quote.statuses.isLoading);
    }
}
