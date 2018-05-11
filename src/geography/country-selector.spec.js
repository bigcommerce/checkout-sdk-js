import { getCountriesState } from './countries.mock';
import { getErrorResponse } from '../common/http-request/responses.mock';
import CountrySelector from './country-selector';

describe('CountrySelector', () => {
    let countrySelector;
    let state;

    beforeEach(() => {
        state = {
            countries: getCountriesState(),
        };
    });

    describe('#getCountries()', () => {
        it('returns a list of countries', () => {
            countrySelector = new CountrySelector(state.countries);

            expect(countrySelector.getCountries()).toEqual(state.countries.data);
        });

        it('returns an empty array if there are no countries', () => {
            countrySelector = new CountrySelector({
                ...state.countries,
                data: [],
            });

            expect(countrySelector.getCountries()).toEqual([]);
        });
    });

    describe('#getLoadError()', () => {
        it('returns error if unable to load', () => {
            const loadError = getErrorResponse();

            countrySelector = new CountrySelector({
                ...state.countries,
                errors: { loadError },
            });

            expect(countrySelector.getLoadError()).toEqual(loadError);
        });

        it('does not returns error if able to load', () => {
            countrySelector = new CountrySelector(state.countries);

            expect(countrySelector.getLoadError()).toBeUndefined();
        });
    });

    describe('#isLoading()', () => {
        it('returns true if loading countries', () => {
            countrySelector = new CountrySelector({
                ...state.countries,
                statuses: { isLoading: true },
            });

            expect(countrySelector.isLoading()).toEqual(true);
        });

        it('returns false if not loading countries', () => {
            countrySelector = new CountrySelector(state.countries);

            expect(countrySelector.isLoading()).toEqual(false);
        });
    });
});
