import { getErrorResponse } from '../common/http-request/responses.mock';
import { getShippingCountriesState } from './shipping-countries.mock';
import ShippingCountrySelector from './shipping-country-selector';

describe('ShippingCountrySelector', () => {
    let shippingCountrySelector;
    let state;

    beforeEach(() => {
        state = {
            shippingCountries: getShippingCountriesState(),
        };
    });

    describe('#getShippingCountries()', () => {
        it('returns a list of countries', () => {
            shippingCountrySelector = new ShippingCountrySelector(state.shippingCountries);

            expect(shippingCountrySelector.getShippingCountries()).toEqual(state.shippingCountries.data);
        });

        it('returns an empty array if there are no countries', () => {
            shippingCountrySelector = new ShippingCountrySelector({
                ...state.shippingCountries,
                data: [],
            });

            expect(shippingCountrySelector.getShippingCountries()).toEqual([]);
        });
    });

    describe('#getLoadError()', () => {
        it('returns error if unable to load', () => {
            const loadError = getErrorResponse();

            shippingCountrySelector = new ShippingCountrySelector({
                ...state.shippingCountries,
                errors: { loadError },
            });

            expect(shippingCountrySelector.getLoadError()).toEqual(loadError);
        });

        it('does not returns error if able to load', () => {
            shippingCountrySelector = new ShippingCountrySelector(state.shippingCountries);

            expect(shippingCountrySelector.getLoadError()).toBeUndefined();
        });
    });

    describe('#isLoading()', () => {
        it('returns true if loading countries', () => {
            shippingCountrySelector = new ShippingCountrySelector({
                ...state.shippingCountries,
                statuses: { isLoading: true },
            });

            expect(shippingCountrySelector.isLoading()).toEqual(true);
        });

        it('returns false if not loading countries', () => {
            shippingCountrySelector = new ShippingCountrySelector(state.shippingCountries);

            expect(shippingCountrySelector.isLoading()).toEqual(false);
        });
    });
});
