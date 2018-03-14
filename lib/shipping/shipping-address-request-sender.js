"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ShippingAddressRequestSender = (function () {
    function ShippingAddressRequestSender(requestSender) {
        this._requestSender = requestSender;
    }
    ShippingAddressRequestSender.prototype.updateAddress = function (address, _a) {
        var timeout = (_a === void 0 ? {} : _a).timeout;
        var url = '/internalapi/v1/checkout/shipping';
        var params = {
            includes: ['cart', 'quote', 'shippingOptions'].join(','),
        };
        return this._requestSender.post(url, { body: address, params: params, timeout: timeout });
    };
    return ShippingAddressRequestSender;
}());
exports.default = ShippingAddressRequestSender;
//# sourceMappingURL=shipping-address-request-sender.js.map