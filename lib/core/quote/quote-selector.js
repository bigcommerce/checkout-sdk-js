"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var QuoteSelector = /** @class */ (function () {
    /**
     * @constructor
     * @param {QuoteState} quote
     */
    function QuoteSelector(quote) {
        if (quote === void 0) { quote = {}; }
        this._quote = quote.data;
        this._quoteMeta = quote.meta;
        this._errors = quote.errors;
        this._statuses = quote.statuses;
    }
    /**
     * @return {Quote}
     */
    QuoteSelector.prototype.getQuote = function () {
        return this._quote;
    };
    /**
     * @return {QuoteMeta}
     */
    QuoteSelector.prototype.getQuoteMeta = function () {
        return this._quoteMeta;
    };
    /**
     * @return {?ErrorResponse}
     */
    QuoteSelector.prototype.getLoadError = function () {
        return this._errors && this._errors.loadError;
    };
    /**
     * @return {boolean}
     */
    QuoteSelector.prototype.isLoading = function () {
        return !!(this._statuses && this._statuses.isLoading);
    };
    return QuoteSelector;
}());
exports.default = QuoteSelector;
//# sourceMappingURL=quote-selector.js.map