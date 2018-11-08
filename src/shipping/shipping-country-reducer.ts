import { combineReducers } from '@bigcommerce/data-store';

import { Country } from '../geography';

import { LoadShippingCountriesAction, ShippingCountryActionType } from './shipping-country-actions';
import ShippingCountryState, { ShippingCountryErrorsState, ShippingCountryStatusesState } from './shipping-country-state';

const DEFAULT_STATE: ShippingCountryState = {
    errors: {},
    statuses: {},
};

export default function shippingCountryReducer(
    state: ShippingCountryState = DEFAULT_STATE,
    action: LoadShippingCountriesAction
): ShippingCountryState {
    const reducer = combineReducers<ShippingCountryState>({
        errors: errorsReducer,
        data: dataReducer,
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
        return action.payload || [];

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
        return { ...errors, loadError: undefined };

    case ShippingCountryActionType.LoadShippingCountriesFailed:
        return { ...errors, loadError: action.payload };

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
        return { ...statuses, isLoading: true };

    case ShippingCountryActionType.LoadShippingCountriesSucceeded:
    case ShippingCountryActionType.LoadShippingCountriesFailed:
        return { ...statuses, isLoading: false };

    default:
        return statuses;
    }
}
