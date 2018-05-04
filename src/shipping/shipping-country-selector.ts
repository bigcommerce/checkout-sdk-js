import { selector } from '../common/selector';

/**
 * @todo Convert this file into TypeScript properly
 */
@selector
export default class ShippingCountrySelector {
    /**
     * @constructor
     * @param {ShippingCountriesState} shippingCountries
     */
    constructor(
        private _shippingCountries: any = {}
    ) {}

    /**
     * @return {Country[]}
     */
    getShippingCountries(): any[] {
        return this._shippingCountries.data;
    }

    getLoadError(): Error | undefined {
        return this._shippingCountries.errors && this._shippingCountries.errors.loadError;
    }

    isLoading(): boolean {
        return !!(this._shippingCountries.statuses && this._shippingCountries.statuses.isLoading);
    }
}
