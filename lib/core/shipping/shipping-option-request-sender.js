"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ShippingOptionRequestSender = /** @class */ (function () {
    /**
     * @constructor
     * @param {RequestSender} requestSender
     */
    function ShippingOptionRequestSender(requestSender) {
        this._requestSender = requestSender;
    }
    /**
     * @param {RequestOptions} [options]
     * @return {Promise<Response<ShippingOptions[]>>}
     */
    ShippingOptionRequestSender.prototype.loadShippingOptions = function (_a) {
        var timeout = (_a === void 0 ? {} : _a).timeout;
        var url = '/internalapi/v1/checkout/shippingoptions';
        var params = {
            includes: ['cart', 'quote', 'shippingOptions'].join(','),
        };
        return this._requestSender.get(url, { params: params, timeout: timeout });
    };
    /**
     * @param {string} addressId
     * @param {string} shippingOptionId
     * @param {RequestOptions} [options]
     * @return {Promise<Response<ShippingOptions[]>>}
     */
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