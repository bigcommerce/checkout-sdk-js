"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CountrySelector = (function () {
    function CountrySelector(countries) {
        if (countries === void 0) { countries = {}; }
        this._countries = countries;
    }
    CountrySelector.prototype.getCountries = function () {
        return this._countries.data;
    };
    CountrySelector.prototype.getLoadError = function () {
        return this._countries.errors && this._countries.errors.loadError;
    };
    CountrySelector.prototype.isLoading = function () {
        return !!(this._countries.statuses && this._countries.statuses.isLoading);
    };
    return CountrySelector;
}());
exports.default = CountrySelector;
//# sourceMappingURL=country-selector.js.map