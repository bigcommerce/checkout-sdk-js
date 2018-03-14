"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PaymentMethodRequestSender = (function () {
    function PaymentMethodRequestSender(requestSender) {
        this._requestSender = requestSender;
    }
    PaymentMethodRequestSender.prototype.loadPaymentMethods = function (_a) {
        var timeout = (_a === void 0 ? {} : _a).timeout;
        var url = '/internalapi/v1/checkout/payments';
        return this._requestSender.get(url, { timeout: timeout });
    };
    PaymentMethodRequestSender.prototype.loadPaymentMethod = function (methodId, _a) {
        var timeout = (_a === void 0 ? {} : _a).timeout;
        var url = "/internalapi/v1/checkout/payments/" + methodId;
        return this._requestSender.get(url, { timeout: timeout });
    };
    return PaymentMethodRequestSender;
}());
exports.default = PaymentMethodRequestSender;
//# sourceMappingURL=payment-method-request-sender.js.map