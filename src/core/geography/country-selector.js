export default class CountrySelector {
    /**
     * @constructor
     * @param {CountriesState} countries
     */
    constructor(countries = {}) {
        this._countries = countries.data;
        this._errors = countries.errors;
        this._statuses = countries.statuses;
    }

    /**
     * @return {Country[]}
     */
    getCountries() {
        return this._countries;
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
