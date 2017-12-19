"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ShippingAddressRequestSender = /** @class */ (function () {
    /**
     * @constructor
     * @param {RequestSender} requestSender
     */
    function ShippingAddressRequestSender(requestSender) {
        this._requestSender = requestSender;
    }
    /**
     * @param {Address} address
     * @param {RequestOptions} [options]
     * @return {Promise<Response<Address>>}
     */
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