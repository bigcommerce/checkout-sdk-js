"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var QuoteSelector = (function () {
    function QuoteSelector(quote) {
        if (quote === void 0) { quote = {}; }
        this._quote = quote;
    }
    QuoteSelector.prototype.getQuote = function () {
        return this._quote.data;
    };
    QuoteSelector.prototype.getQuoteMeta = function () {
        return this._quote.meta;
    };
    QuoteSelector.prototype.getLoadError = function () {
        return this._quote.errors && this._quote.errors.loadError;
    };
    QuoteSelector.prototype.isLoading = function () {
        return !!(this._quote.statuses && this._quote.statuses.isLoading);
    };
    return QuoteSelector;
}());
exports.default = QuoteSelector;
//# sourceMappingURL=quote-selector.js.map