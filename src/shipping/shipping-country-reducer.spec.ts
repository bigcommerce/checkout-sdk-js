import { createErrorAction } from '@bigcommerce/data-store';

import { RequestErrorFactory } from '../common/error';
import { getErrorResponse } from '../common/http-request/responses.mock';
import { getCountries } from '../geography/countries.mock';

import { LoadShippingCountriesAction, ShippingCountryActionType } from './shipping-country-actions';
import shippingCountryReducer from './shipping-country-reducer';
import ShippingCountryState from './shipping-country-state';

describe('shippingCountryReducer()', () => {
    let initialState: ShippingCountryState;

    beforeEach(() => {
        initialState = {
            data: getCountries(),
            errors: {},
            statuses: {},
        };
    });

    it('returns a new state when fetching new countries', () => {
        const action: LoadShippingCountriesAction = {
            type: ShippingCountryActionType.LoadShippingCountriesRequested,
        };

        expect(shippingCountryReducer(initialState, action)).toEqual({
            ...initialState,
            errors: {},
            statuses: { isLoading: true },
        });
    });

    it('returns a new state when countries are fetched', () => {
        const action: LoadShippingCountriesAction = {
            type: ShippingCountryActionType.LoadShippingCountriesSucceeded,
            payload: [
                { code: 'JP', name: 'Japan', hasPostalCodes: false, subdivisions: [] },
            ],
        };

        expect(shippingCountryReducer(initialState, action)).toEqual({
            data: action.payload,
            errors: { loadError: undefined },
            statuses: { isLoading: false },
        });
    });

    it('returns a new state when countries cannot be fetched', () => {
        const action = createErrorAction(
            ShippingCountryActionType.LoadShippingCountriesFailed,
            new RequestErrorFactory().createError(getErrorResponse())
        );

        expect(shippingCountryReducer(initialState, action)).toEqual({
            ...initialState,
            errors: { loadError: action.payload },
            statuses: { isLoading: false },
        });
    });
});
