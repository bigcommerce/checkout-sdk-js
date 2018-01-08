"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ShippingCountryRequestSender = (function () {
    function ShippingCountryRequestSender(requestSender, config) {
        this._requestSender = requestSender;
        this._config = config;
    }
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