"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var QuoteRequestSender = /** @class */ (function () {
    /**
     * @constructor
     * @param {RequestSender} requestSender
     */
    function QuoteRequestSender(requestSender) {
        this._requestSender = requestSender;
    }
    /**
     * @param {RequestOptions} [options]
     * @return {Promise<Response<Quote>>}
     */
    QuoteRequestSender.prototype.loadQuote = function (_a) {
        var timeout = (_a === void 0 ? {} : _a).timeout;
        var url = '/internalapi/v1/checkout/quote';
        var params = {
            includes: ['cart', 'customer', 'shippingOptions', 'order'].join(','),
        };
        return this._requestSender.get(url, { params: params, timeout: timeout });
    };
    return QuoteRequestSender;
}());
exports.default = QuoteRequestSender;
//# sourceMappingURL=quote-request-sender.js.map