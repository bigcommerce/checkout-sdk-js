"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CountrySelector = /** @class */ (function () {
    /**
     * @constructor
     * @param {CountriesState} countries
     */
    function CountrySelector(countries) {
        if (countries === void 0) { countries = {}; }
        this._countries = countries.data;
        this._errors = countries.errors;
        this._statuses = countries.statuses;
    }
    /**
     * @return {Country[]}
     */
    CountrySelector.prototype.getCountries = function () {
        return this._countries;
    };
    /**
     * @return {?ErrorResponse}
     */
    CountrySelector.prototype.getLoadError = function () {
        return this._errors && this._errors.loadError;
    };
    /**
     * @return {boolean}
     */
    CountrySelector.prototype.isLoading = function () {
        return !!(this._statuses && this._statuses.isLoading);
    };
    return CountrySelector;
}());
exports.default = CountrySelector;
//# sourceMappingURL=country-selector.js.map