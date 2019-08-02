import { createSelector } from '../common/selector';
import { memoizeOne } from '../common/utility';
import { Country } from '../geography';

import ShippingCountryState, { DEFAULT_STATE } from './shipping-country-state';

export default interface ShippingCountrySelector {
    getShippingCountries(): Country[] | undefined;
    getLoadError(): Error | undefined;
    isLoading(): boolean;
}

export type ShippingCountrySelectorFactory = (state: ShippingCountryState) => ShippingCountrySelector;

export function createShippingCountrySelectorFactory(): ShippingCountrySelectorFactory {
    const getShippingCountries = createSelector(
        (state: ShippingCountryState) => state.data,
        data => () => data
    );

    const getLoadError = createSelector(
        (state: ShippingCountryState) => state.errors.loadError,
        error => () => error
    );

    const isLoading = createSelector(
        (state: ShippingCountryState) => state.statuses.isLoading,
        status => () => !!status
    );

    return memoizeOne((
        state: ShippingCountryState = DEFAULT_STATE
    ): ShippingCountrySelector => {
        return {
            getShippingCountries: getShippingCountries(state),
            getLoadError: getLoadError(state),
            isLoading: isLoading(state),
        };
    });
}
