import { CheckoutStoreState } from '../checkout';
import { getCheckoutStoreState } from '../checkout/checkouts.mock';

import ShippingCountrySelector, { createShippingCountrySelectorFactory, ShippingCountrySelectorFactory } from './shipping-country-selector';

describe('ShippingCountrySelector', () => {
    let createShippingCountrySelector: ShippingCountrySelectorFactory;
    let shippingCountrySelector: ShippingCountrySelector;
    let state: CheckoutStoreState;

    beforeEach(() => {
        createShippingCountrySelector = createShippingCountrySelectorFactory();
        state = getCheckoutStoreState();
    });

    describe('#getShippingCountries()', () => {
        it('returns a list of countries', () => {
            shippingCountrySelector = createShippingCountrySelector(state.shippingCountries);

            expect(shippingCountrySelector.getShippingCountries()).toEqual(state.shippingCountries.data);
        });

        it('returns an empty array if there are no countries', () => {
            shippingCountrySelector = createShippingCountrySelector({
                ...state.shippingCountries,
                data: [],
            });

            expect(shippingCountrySelector.getShippingCountries()).toEqual([]);
        });
    });

    describe('#getLoadError()', () => {
        it('returns error if unable to load', () => {
            const loadError = new Error();

            shippingCountrySelector = createShippingCountrySelector({
                ...state.shippingCountries,
                errors: { loadError },
            });

            expect(shippingCountrySelector.getLoadError()).toEqual(loadError);
        });

        it('does not returns error if able to load', () => {
            shippingCountrySelector = createShippingCountrySelector(state.shippingCountries);

            expect(shippingCountrySelector.getLoadError()).toBeUndefined();
        });
    });

    describe('#isLoading()', () => {
        it('returns true if loading countries', () => {
            shippingCountrySelector = createShippingCountrySelector({
                ...state.shippingCountries,
                statuses: { isLoading: true },
            });

            expect(shippingCountrySelector.isLoading()).toEqual(true);
        });

        it('returns false if not loading countries', () => {
            shippingCountrySelector = createShippingCountrySelector(state.shippingCountries);

            expect(shippingCountrySelector.isLoading()).toEqual(false);
        });
    });
});
