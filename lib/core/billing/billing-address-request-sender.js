"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BillingAddressRequestSender = /** @class */ (function () {
    /**
     * @constructor
     * @param {RequestSender} requestSender
     */
    function BillingAddressRequestSender(requestSender) {
        this._requestSender = requestSender;
    }
    /**
     * @param {Address} address
     * @param {RequestOptions} [options]
     * @return {Promise<Address>}
     */
    BillingAddressRequestSender.prototype.updateAddress = function (address, _a) {
        var timeout = (_a === void 0 ? {} : _a).timeout;
        var url = '/internalapi/v1/checkout/billing';
        var params = {
            includes: ['cart', 'quote'].join(','),
        };
        return this._requestSender.post(url, { body: address, params: params, timeout: timeout });
    };
    return BillingAddressRequestSender;
}());
exports.default = BillingAddressRequestSender;
//# sourceMappingURL=billing-address-request-sender.js.map