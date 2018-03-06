export default class CountrySelector {
    /**
     * @constructor
     * @param {CountriesState} countries
     */
    constructor(countries = {}) {
        this._countries = countries;
    }

    /**
     * @return {Country[]}
     */
    getCountries() {
        return this._countries.data;
    }

    /**
     * @return {?ErrorResponse}
     */
    getLoadError() {
        return this._countries.errors && this._countries.errors.loadError;
    }

    /**
     * @return {boolean}
     */
    isLoading() {
        return !!(this._countries.statuses && this._countries.statuses.isLoading);
    }
}
