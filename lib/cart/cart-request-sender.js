"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CartRequestSender = (function () {
    function CartRequestSender(requestSender) {
        this._requestSender = requestSender;
    }
    CartRequestSender.prototype.loadCart = function (_a) {
        var timeout = (_a === void 0 ? {} : _a).timeout;
        var url = '/internalapi/v1/checkout/cart';
        return this._requestSender.get(url, { timeout: timeout });
    };
    CartRequestSender.prototype.loadCarts = function (_a) {
        var timeout = (_a === void 0 ? {} : _a).timeout;
        var url = '/api/storefront/carts';
        return this._requestSender.get(url, { timeout: timeout });
    };
    return CartRequestSender;
}());
exports.default = CartRequestSender;
//# sourceMappingURL=cart-request-sender.js.map