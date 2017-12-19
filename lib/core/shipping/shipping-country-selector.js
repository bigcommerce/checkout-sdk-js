"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ShippingCountrySelector = /** @class */ (function () {
    /**
     * @constructor
     * @param {ShippingCountriesState} shippingCountries
     */
    function ShippingCountrySelector(shippingCountries) {
        if (shippingCountries === void 0) { shippingCountries = {}; }
        this._shippingCountries = shippingCountries.data;
        this._errors = shippingCountries.errors;
        this._statuses = shippingCountries.statuses;
    }
    /**
     * @return {Country[]}
     */
    ShippingCountrySelector.prototype.getShippingCountries = function () {
        return this._shippingCountries;
    };
    /**
     * @return {?ErrorResponse}
     */
    ShippingCountrySelector.prototype.getLoadError = function () {
        return this._errors && this._errors.loadError;
    };
    /**
     * @return {boolean}
     */
    ShippingCountrySelector.prototype.isLoading = function () {
        return !!(this._statuses && this._statuses.isLoading);
    };
    return ShippingCountrySelector;
}());
exports.default = ShippingCountrySelector;
//# sourceMappingURL=shipping-country-selector.js.map