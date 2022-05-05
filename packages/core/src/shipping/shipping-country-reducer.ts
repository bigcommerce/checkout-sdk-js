import { combineReducers, composeReducers, Action } from '@bigcommerce/data-store';

import { clearErrorReducer } from '../common/error';
import { arrayReplace, objectSet } from '../common/utility';
import { Country } from '../geography';

import { LoadShippingCountriesAction, ShippingCountryActionType } from './shipping-country-actions';
import ShippingCountryState, { DEFAULT_STATE, ShippingCountryErrorsState, ShippingCountryStatusesState } from './shipping-country-state';

export default function shippingCountryReducer(
    state: ShippingCountryState = DEFAULT_STATE,
    action: Action
): ShippingCountryState {
    const reducer = combineReducers<ShippingCountryState>({
        data: dataReducer,
        errors: composeReducers(errorsReducer, clearErrorReducer),
        statuses: statusesReducer,
    });

    return reducer(state, action);
}

function dataReducer(
    data: Country[] | undefined,
    action: LoadShippingCountriesAction
): Country[] | undefined {
    switch (action.type) {
    case ShippingCountryActionType.LoadShippingCountriesSucceeded:
        return arrayReplace(data, action.payload);

    default:
        return data;
    }
}

function errorsReducer(
    errors: ShippingCountryErrorsState = DEFAULT_STATE.errors,
    action: LoadShippingCountriesAction
): ShippingCountryErrorsState {
    switch (action.type) {
    case ShippingCountryActionType.LoadShippingCountriesRequested:
    case ShippingCountryActionType.LoadShippingCountriesSucceeded:
        return objectSet(errors, 'loadError', undefined);

    case ShippingCountryActionType.LoadShippingCountriesFailed:
        return objectSet(errors, 'loadError', action.payload);

    default:
        return errors;
    }
}

function statusesReducer(
    statuses: ShippingCountryStatusesState = DEFAULT_STATE.statuses,
    action: LoadShippingCountriesAction
): ShippingCountryStatusesState {
    switch (action.type) {
    case ShippingCountryActionType.LoadShippingCountriesRequested:
        return objectSet(statuses, 'isLoading', true);

    case ShippingCountryActionType.LoadShippingCountriesSucceeded:
    case ShippingCountryActionType.LoadShippingCountriesFailed:
        return objectSet(statuses, 'isLoading', false);

    default:
        return statuses;
    }
}
