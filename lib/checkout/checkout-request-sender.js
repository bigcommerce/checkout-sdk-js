"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CheckoutRequestSender = (function () {
    function CheckoutRequestSender(requestSender) {
        this._requestSender = requestSender;
    }
    CheckoutRequestSender.prototype.loadCheckout = function (id, _a) {
        var timeout = (_a === void 0 ? {} : _a).timeout;
        var url = "/api/storefront/checkout/" + id;
        return this._requestSender.get(url, { timeout: timeout });
    };
    return CheckoutRequestSender;
}());
exports.default = CheckoutRequestSender;
//# sourceMappingURL=checkout-request-sender.js.map