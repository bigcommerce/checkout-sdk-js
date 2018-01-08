"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var OrderRequestSender = (function () {
    function OrderRequestSender(requestSender) {
        this._requestSender = requestSender;
    }
    OrderRequestSender.prototype.loadOrder = function (orderId, _a) {
        var timeout = (_a === void 0 ? {} : _a).timeout;
        var url = "/internalapi/v1/checkout/order/" + orderId;
        return this._requestSender.get(url, { timeout: timeout });
    };
    OrderRequestSender.prototype.submitOrder = function (body, _a) {
        var timeout = (_a === void 0 ? {} : _a).timeout;
        var url = '/internalapi/v1/checkout/order';
        return this._requestSender.post(url, { body: body, timeout: timeout });
    };
    OrderRequestSender.prototype.finalizeOrder = function (orderId, _a) {
        var timeout = (_a === void 0 ? {} : _a).timeout;
        var url = "/internalapi/v1/checkout/order/" + orderId;
        return this._requestSender.post(url, { timeout: timeout });
    };
    return OrderRequestSender;
}());
exports.default = OrderRequestSender;
//# sourceMappingURL=order-request-sender.js.map