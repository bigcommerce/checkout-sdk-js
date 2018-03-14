"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CountryRequestSender = (function () {
    function CountryRequestSender(requestSender, config) {
        this._requestSender = requestSender;
        this._config = config;
    }
    CountryRequestSender.prototype.loadCountries = function (_a) {
        var timeout = (_a === void 0 ? {} : _a).timeout;
        var url = '/internalapi/v1/store/countries';
        var headers = {
            'Accept-Language': this._config.locale,
        };
        return this._requestSender.get(url, { headers: headers, timeout: timeout });
    };
    return CountryRequestSender;
}());
exports.default = CountryRequestSender;
//# sourceMappingURL=country-request-sender.js.map