export default class QuoteSelector {
    /**
     * @constructor
     * @param {QuoteState} quote
     */
    constructor(quote = {}) {
        this._quote = quote.data;
        this._quoteMeta = quote.meta;
        this._errors = quote.errors;
        this._statuses = quote.statuses;
    }

    /**
     * @return {Quote}
     */
    getQuote() {
        return this._quote;
    }

    /**
     * @return {QuoteMeta}
     */
    getQuoteMeta() {
        return this._quoteMeta;
    }

    /**
     * @return {?ErrorResponse}
     */
    getLoadError() {
        return this._errors && this._errors.loadError;
    }

    /**
     * @return {boolean}
     */
    isLoading() {
        return !!(this._statuses && this._statuses.isLoading);
    }
}
