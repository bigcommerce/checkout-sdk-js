"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CustomerRequestSender = (function () {
    function CustomerRequestSender(requestSender) {
        this._requestSender = requestSender;
    }
    CustomerRequestSender.prototype.signInCustomer = function (credentials, _a) {
        var timeout = (_a === void 0 ? {} : _a).timeout;
        var url = '/internalapi/v1/checkout/customer';
        var params = {
            includes: ['cart', 'quote', 'shippingOptions'].join(','),
        };
        return this._requestSender.post(url, { params: params, timeout: timeout, body: credentials });
    };
    CustomerRequestSender.prototype.signOutCustomer = function (_a) {
        var timeout = (_a === void 0 ? {} : _a).timeout;
        var url = '/internalapi/v1/checkout/customer';
        var params = {
            includes: ['cart', 'quote', 'shippingOptions'].join(','),
        };
        return this._requestSender.delete(url, { params: params, timeout: timeout });
    };
    return CustomerRequestSender;
}());
exports.default = CustomerRequestSender;
//# sourceMappingURL=customer-request-sender.js.map