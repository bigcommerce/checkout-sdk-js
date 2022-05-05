import { CheckoutStoreState } from '../checkout';
import { getCheckoutStoreState } from '../checkout/checkouts.mock';

import CountrySelector, { createCountrySelectorFactory, CountrySelectorFactory } from './country-selector';

describe('CountrySelector', () => {
    let countrySelector: CountrySelector;
    let createCountrySelector: CountrySelectorFactory;
    let state: CheckoutStoreState;

    beforeEach(() => {
        createCountrySelector = createCountrySelectorFactory();
        state = getCheckoutStoreState();
    });

    describe('#getCountries()', () => {
        it('returns a list of countries', () => {
            countrySelector = createCountrySelector(state.countries);

            expect(countrySelector.getCountries()).toEqual(state.countries.data);
        });

        it('returns an empty array if there are no countries', () => {
            countrySelector = createCountrySelector({
                ...state.countries,
                data: [],
            });

            expect(countrySelector.getCountries()).toEqual([]);
        });
    });

    describe('#getLoadError()', () => {
        it('returns error if unable to load', () => {
            const loadError = new Error();

            countrySelector = createCountrySelector({
                ...state.countries,
                errors: { loadError },
            });

            expect(countrySelector.getLoadError()).toEqual(loadError);
        });

        it('does not returns error if able to load', () => {
            countrySelector = createCountrySelector(state.countries);

            expect(countrySelector.getLoadError()).toBeUndefined();
        });
    });

    describe('#isLoading()', () => {
        it('returns true if loading countries', () => {
            countrySelector = createCountrySelector({
                ...state.countries,
                statuses: { isLoading: true },
            });

            expect(countrySelector.isLoading()).toEqual(true);
        });

        it('returns false if not loading countries', () => {
            countrySelector = createCountrySelector(state.countries);

            expect(countrySelector.isLoading()).toEqual(false);
        });
    });
});
