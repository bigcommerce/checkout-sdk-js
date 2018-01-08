"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ShippingCountrySelector = (function () {
    function ShippingCountrySelector(shippingCountries) {
        if (shippingCountries === void 0) { shippingCountries = {}; }
        this._shippingCountries = shippingCountries;
    }
    ShippingCountrySelector.prototype.getShippingCountries = function () {
        return this._shippingCountries.data;
    };
    ShippingCountrySelector.prototype.getLoadError = function () {
        return this._shippingCountries.errors && this._shippingCountries.errors.loadError;
    };
    ShippingCountrySelector.prototype.isLoading = function () {
        return !!(this._shippingCountries.statuses && this._shippingCountries.statuses.isLoading);
    };
    return ShippingCountrySelector;
}());
exports.default = ShippingCountrySelector;
//# sourceMappingURL=shipping-country-selector.js.map