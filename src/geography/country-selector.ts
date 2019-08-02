import { createSelector } from '../common/selector';
import { memoizeOne } from '../common/utility';

import Country from './country';
import CountryState, { DEFAULT_STATE } from './country-state';

export default interface CountrySelector {
    getCountries(): Country[] | undefined;
    getLoadError(): Error | undefined;
    isLoading(): boolean;
}

export type CountrySelectorFactory = (state: CountryState) => CountrySelector;

export function createCountrySelectorFactory(): CountrySelectorFactory {
    const getCountries = createSelector(
        (state: CountryState) => state.data,
        countries => () => countries
    );

    const getLoadError = createSelector(
        (state: CountryState) => state.errors.loadError,
        error => () => error
    );

    const isLoading = createSelector(
        (state: CountryState) => !!state.statuses.isLoading,
        status => () => status
    );

    return memoizeOne((
        state: CountryState = DEFAULT_STATE
    ): CountrySelector => {
        return {
            getCountries: getCountries(state),
            getLoadError: getLoadError(state),
            isLoading: isLoading(state),
        };
    });
}
