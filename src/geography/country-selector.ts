/**
 * @todo Convert this file into TypeScript properly
 */
export default class CountrySelector {
    /**
     * @constructor
     * @param {CountriesState} countries
     */
    constructor(
        private _countries: any = {}
    ) {}

    /**
     * @return {Country[]}
     */
    getCountries(): any[] {
        return this._countries.data;
    }

    getLoadError(): Error | undefined {
        return this._countries.errors && this._countries.errors.loadError;
    }

    isLoading(): boolean {
        return !!(this._countries.statuses && this._countries.statuses.isLoading);
    }
}
