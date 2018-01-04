export default class ShippingCountrySelector {
    /**
     * @constructor
     * @param {ShippingCountriesState} shippingCountries
     */
    constructor(shippingCountries = {}) {
        this._shippingCountries = shippingCountries;
    }

    /**
     * @return {Country[]}
     */
    getShippingCountries() {
        return this._shippingCountries.data;
    }

    /**
     * @return {?ErrorResponse}
     */
    getLoadError() {
        return this._shippingCountries.errors && this._shippingCountries.errors.loadError;
    }

    /**
     * @return {boolean}
     */
    isLoading() {
        return !!(this._shippingCountries.statuses && this._shippingCountries.statuses.isLoading);
    }
}
