import { RequestErrorFactory } from '../common/error';
import { getErrorResponse } from '../common/http-request/responses.mock';

import { getCountries } from './countries.mock';
import { CountryActionType, LoadCountriesAction } from './country-actions';
import countryReducer from './country-reducer';
import CountryState from './country-state';

describe('countryReducer()', () => {
    let initialState: CountryState;

    beforeEach(() => {
        initialState = {
            data: getCountries(),
            errors: {},
            statuses: {},
        };
    });

    it('returns a new state when fetching new countries', () => {
        const action: LoadCountriesAction = {
            type: CountryActionType.LoadCountriesRequested,
        };

        expect(countryReducer(initialState, action)).toEqual({
            ...initialState,
            errors: {},
            statuses: { isLoading: true },
        });
    });

    it('returns a new state when countries are fetched', () => {
        const action: LoadCountriesAction = {
            type: CountryActionType.LoadCountriesSucceeded,
            payload: [
                { code: 'JP', name: 'Japan', hasPostalCodes: false, subdivisions: [] },
            ],
        };

        expect(countryReducer(initialState, action)).toEqual({
            data: action.payload,
            errors: { loadError: undefined },
            statuses: { isLoading: false },
        });
    });

    it('returns a new state when countries cannot be fetched', () => {
        const action: LoadCountriesAction = {
            type: CountryActionType.LoadCountriesFailed,
            payload: new RequestErrorFactory().createError(getErrorResponse()),
        };

        expect(countryReducer(initialState, action)).toEqual({
            ...initialState,
            errors: { loadError: action.payload },
            statuses: { isLoading: false },
        });
    });
});
