export default class ShippingCountrySelector {
    /**
     * @constructor
     * @param {ShippingCountriesState} shippingCountries
     */
    constructor(shippingCountries = {}) {
        this._shippingCountries = shippingCountries.data;
        this._errors = shippingCountries.errors;
        this._statuses = shippingCountries.statuses;
    }

    /**
     * @return {Country[]}
     */
    getShippingCountries() {
        return this._shippingCountries;
    }

    /**
     * @return {?ErrorResponse}
     */
    getLoadError() {
        return this._errors && this._errors.loadError;
    }

    /**
     * @return {boolean}
     */
    isLoading() {
        return !!(this._statuses && this._statuses.isLoading);
    }
}
