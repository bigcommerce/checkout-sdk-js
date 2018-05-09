import { combineReducers, Action } from '@bigcommerce/data-store';

import Country from './country';
import * as actionTypes from './country-action-types';
import CountryState, { CountryErrorsState, CountryStatusesState } from './country-state';

const DEFAULT_STATE: CountryState = {
    errors: {},
    statuses: {},
};

/**
 * @todo Convert this file into TypeScript properly
 * i.e.: Action
 */
export default function countryReducer(state: CountryState = DEFAULT_STATE, action: Action): CountryState {
    const reducer = combineReducers<CountryState>({
        data: dataReducer,
        errors: errorsReducer,
        statuses: statusesReducer,
    });

    return reducer(state, action);
}

function dataReducer(data: Country[] | undefined, action: Action): Country[] | undefined {
    switch (action.type) {
    case actionTypes.LOAD_COUNTRIES_SUCCEEDED:
        return action.payload || [];

    default:
        return data;
    }
}

function errorsReducer(errors: CountryErrorsState = DEFAULT_STATE.errors, action: Action): CountryErrorsState {
    switch (action.type) {
    case actionTypes.LOAD_COUNTRIES_REQUESTED:
    case actionTypes.LOAD_COUNTRIES_SUCCEEDED:
        return { ...errors, loadError: undefined };

    case actionTypes.LOAD_COUNTRIES_FAILED:
        return { ...errors, loadError: action.payload };

    default:
        return errors;
    }
}

function statusesReducer(statuses: CountryStatusesState = DEFAULT_STATE.statuses, action: Action): CountryStatusesState {
    switch (action.type) {
    case actionTypes.LOAD_COUNTRIES_REQUESTED:
        return { ...statuses, isLoading: true };

    case actionTypes.LOAD_COUNTRIES_SUCCEEDED:
    case actionTypes.LOAD_COUNTRIES_FAILED:
        return { ...statuses, isLoading: false };

    default:
        return statuses;
    }
}
