import { getCountries } from './countries.mock';
import { getErrorResponse } from '../common/http-request/responses.mock';
import countryReducer from './country-reducer';
import * as actionTypes from './country-action-types';

describe('countryReducer()', () => {
    let initialState;

    beforeEach(() => {
        initialState = {
            data: getCountries(),
        };
    });

    it('returns a new state when fetching new countries', () => {
        const action = {
            type: actionTypes.LOAD_COUNTRIES_REQUESTED,
        };

        expect(countryReducer(initialState, action)).toEqual({
            ...initialState,
            errors: {},
            statuses: { isLoading: true },
        });
    });

    it('returns a new state when countries are fetched', () => {
        const action = {
            type: actionTypes.LOAD_COUNTRIES_SUCCEEDED,
            payload: [
                { code: 'JP', name: 'Japan' },
            ],
        };

        expect(countryReducer(initialState, action)).toEqual({
            data: action.payload,
            errors: { loadError: undefined },
            statuses: { isLoading: false },
        });
    });

    it('returns a new state when countries cannot be fetched', () => {
        const action = {
            type: actionTypes.LOAD_COUNTRIES_FAILED,
            payload: getErrorResponse(),
        };

        expect(countryReducer(initialState, action)).toEqual({
            ...initialState,
            errors: { loadError: action.payload },
            statuses: { isLoading: false },
        });
    });
});
