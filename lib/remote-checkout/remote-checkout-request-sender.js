"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RemoteCheckoutRequestSender = (function () {
    function RemoteCheckoutRequestSender(requestSender) {
        this._requestSender = requestSender;
    }
    RemoteCheckoutRequestSender.prototype.initializeBilling = function (methodName, params, _a) {
        var timeout = (_a === void 0 ? {} : _a).timeout;
        var url = "/remote-checkout/" + methodName + "/billing";
        return this._requestSender.get(url, { params: params, timeout: timeout });
    };
    RemoteCheckoutRequestSender.prototype.initializeShipping = function (methodName, params, _a) {
        var timeout = (_a === void 0 ? {} : _a).timeout;
        var url = "/remote-checkout/" + methodName + "/shipping";
        return this._requestSender.get(url, { params: params, timeout: timeout });
    };
    RemoteCheckoutRequestSender.prototype.initializePayment = function (methodName, params, _a) {
        var timeout = (_a === void 0 ? {} : _a).timeout;
        var url = "/remote-checkout/" + methodName + "/payment";
        return this._requestSender.get(url, { params: params, timeout: timeout });
    };
    RemoteCheckoutRequestSender.prototype.signOut = function (methodName, _a) {
        var timeout = (_a === void 0 ? {} : _a).timeout;
        var url = "/remote-checkout/" + methodName + "/signout";
        return this._requestSender.get(url, { timeout: timeout });
    };
    RemoteCheckoutRequestSender.prototype.generateToken = function (_a) {
        var timeout = (_a === void 0 ? {} : _a).timeout;
        var url = '/remote-checkout-token';
        return this._requestSender.get(url, { timeout: timeout });
    };
    RemoteCheckoutRequestSender.prototype.trackAuthorizationEvent = function (_a) {
        var timeout = (_a === void 0 ? {} : _a).timeout;
        var url = '/remote-checkout/events/shopper-checkout-service-provider-authorization-requested';
        return this._requestSender.post(url, { timeout: timeout });
    };
    return RemoteCheckoutRequestSender;
}());
exports.default = RemoteCheckoutRequestSender;
//# sourceMappingURL=remote-checkout-request-sender.js.map