import { selector } from '../common/selector';
import { Country } from '../geography';

import ShippingCountryState from './shipping-country-state';

@selector
export default class ShippingCountrySelector {
    constructor(
        private _shippingCountries: ShippingCountryState
    ) {}

    getShippingCountries(): Country[] | undefined {
        return this._shippingCountries.data;
    }

    getLoadError(): Error | undefined {
        return this._shippingCountries.errors.loadError;
    }

    isLoading(): boolean {
        return !!this._shippingCountries.statuses.isLoading;
    }
}
