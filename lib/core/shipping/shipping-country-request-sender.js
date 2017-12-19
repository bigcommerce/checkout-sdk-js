"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ShippingCountryRequestSender = /** @class */ (function () {
    /**
     * @constructor
     * @param {RequestSender} requestSender
     * @param {Object} config
     * @param {string} config.locale
     */
    function ShippingCountryRequestSender(requestSender, config) {
        this._requestSender = requestSender;
        this._config = config;
    }
    /**
     * @param {RequestOptions} [options]
     * @return {Promise<Response<Country[]>>}
     */
    ShippingCountryRequestSender.prototype.loadCountries = function (_a) {
        var timeout = (_a === void 0 ? {} : _a).timeout;
        var url = '/internalapi/v1/shipping/countries';
        var headers = {
            'Accept-Language': this._config.locale,
        };
        return this._requestSender.get(url, { headers: headers, timeout: timeout });
    };
    return ShippingCountryRequestSender;
}());
exports.default = ShippingCountryRequestSender;
//# sourceMappingURL=shipping-country-request-sender.js.map