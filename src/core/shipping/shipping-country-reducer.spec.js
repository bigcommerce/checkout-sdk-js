import { getCountries } from '../geography/countries.mock';
import { getErrorResponseBody } from '../common/error/errors.mock';
import shippingCountryReducer from './shipping-country-reducer';
import * as actionTypes from './shipping-country-action-types';

describe('shippingCountryReducer()', () => {
    let initialState;

    beforeEach(() => {
        initialState = {
            data: getCountries(),
        };
    });

    it('returns a new state when fetching new countries', () => {
        const action = {
            type: actionTypes.LOAD_SHIPPING_COUNTRIES_REQUESTED,
        };

        expect(shippingCountryReducer(initialState, action)).toEqual({
            ...initialState,
            errors: {},
            statuses: { isLoading: true },
        });
    });

    it('returns a new state when countries are fetched', () => {
        const action = {
            type: actionTypes.LOAD_SHIPPING_COUNTRIES_SUCCEEDED,
            payload: [
                { code: 'JP', name: 'Japan' },
            ],
        };

        expect(shippingCountryReducer(initialState, action)).toEqual({
            data: action.payload,
            errors: { loadError: undefined },
            statuses: { isLoading: false },
        });
    });

    it('returns a new state when countries cannot be fetched', () => {
        const action = {
            type: actionTypes.LOAD_SHIPPING_COUNTRIES_FAILED,
            payload: getErrorResponseBody(),
        };

        expect(shippingCountryReducer(initialState, action)).toEqual({
            ...initialState,
            errors: { loadError: action.payload },
            statuses: { isLoading: false },
        });
    });
});
