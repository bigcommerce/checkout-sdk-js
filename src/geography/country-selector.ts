import { selector } from '../common/selector';

import Country from './country';
import CountryState from './country-state';

@selector
export default class CountrySelector {
    constructor(
        private _countries: CountryState
    ) {}

    getCountries(): Country[] | undefined {
        return this._countries.data;
    }

    getLoadError(): Error | undefined {
        return this._countries.errors.loadError;
    }

    isLoading(): boolean {
        return !!this._countries.statuses.isLoading;
    }
}
