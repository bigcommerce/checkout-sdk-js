import { combineReducers, composeReducers, Action } from '@bigcommerce/data-store';

import { clearErrorReducer } from '../common/error';
import { arrayReplace, objectSet } from '../common/utility';

import Country from './country';
import { CountryActionType, LoadCountriesAction } from './country-actions';
import CountryState, { CountryErrorsState, CountryStatusesState, DEFAULT_STATE } from './country-state';

export default function countryReducer(
    state: CountryState = DEFAULT_STATE,
    action: Action
): CountryState {
    const reducer = combineReducers<CountryState>({
        data: dataReducer,
        errors: composeReducers(errorsReducer, clearErrorReducer),
        statuses: statusesReducer,
    });

    return reducer(state, action);
}

function dataReducer(
    data: Country[] | undefined,
    action: LoadCountriesAction
): Country[] | undefined {
    switch (action.type) {
    case CountryActionType.LoadCountriesSucceeded:
        return arrayReplace(data, action.payload);

    default:
        return data;
    }
}

function errorsReducer(
    errors: CountryErrorsState = DEFAULT_STATE.errors,
    action: LoadCountriesAction
): CountryErrorsState {
    switch (action.type) {
    case CountryActionType.LoadCountriesRequested:
    case CountryActionType.LoadCountriesSucceeded:
        return objectSet(errors, 'loadError', undefined);

    case CountryActionType.LoadCountriesFailed:
        return objectSet(errors, 'loadError', action.payload);

    default:
        return errors;
    }
}

function statusesReducer(
    statuses: CountryStatusesState = DEFAULT_STATE.statuses,
    action: LoadCountriesAction
): CountryStatusesState {
    switch (action.type) {
    case CountryActionType.LoadCountriesRequested:
        return objectSet(statuses, 'isLoading', true);

    case CountryActionType.LoadCountriesSucceeded:
    case CountryActionType.LoadCountriesFailed:
        return objectSet(statuses, 'isLoading', false);

    default:
        return statuses;
    }
}
