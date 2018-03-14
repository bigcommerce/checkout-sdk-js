"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ShippingOptionRequestSender = (function () {
    function ShippingOptionRequestSender(requestSender) {
        this._requestSender = requestSender;
    }
    ShippingOptionRequestSender.prototype.loadShippingOptions = function (_a) {
        var timeout = (_a === void 0 ? {} : _a).timeout;
        var url = '/internalapi/v1/checkout/shippingoptions';
        var params = {
            includes: ['cart', 'quote', 'shippingOptions'].join(','),
        };
        return this._requestSender.get(url, { params: params, timeout: timeout });
    };
    ShippingOptionRequestSender.prototype.selectShippingOption = function (addressId, shippingOptionId, _a) {
        var timeout = (_a === void 0 ? {} : _a).timeout;
        var body = { addressId: addressId, shippingOptionId: shippingOptionId };
        var url = '/internalapi/v1/checkout/shippingoptions';
        var params = {
            includes: ['cart', 'quote', 'shippingOptions'].join(','),
        };
        return this._requestSender.put(url, { body: body, params: params, timeout: timeout });
    };
    return ShippingOptionRequestSender;
}());
exports.default = ShippingOptionRequestSender;
//# sourceMappingURL=shipping-option-request-sender.js.map