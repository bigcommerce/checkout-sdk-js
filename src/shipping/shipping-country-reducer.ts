import { combineReducers, Action } from '@bigcommerce/data-store';

import { Country } from '../geography';

import * as actionTypes from './shipping-country-action-types';
import ShippingCountryState, { ShippingCountryErrorsState, ShippingCountryStatusesState } from './shipping-country-state';

const DEFAULT_STATE: ShippingCountryState = {
    errors: {},
    statuses: {},
};

/**
 * @todo Convert this file into TypeScript properly
 * i.e.: Action
 */
export default function shippingCountryReducer(state: ShippingCountryState = DEFAULT_STATE, action: Action): ShippingCountryState {
    const reducer = combineReducers<ShippingCountryState>({
        errors: errorsReducer,
        data: dataReducer,
        statuses: statusesReducer,
    });

    return reducer(state, action);
}

function dataReducer(data: Country[] | undefined, action: Action): Country[] | undefined {
    switch (action.type) {
    case actionTypes.LOAD_SHIPPING_COUNTRIES_SUCCEEDED:
        return action.payload || [];

    default:
        return data;
    }
}

function errorsReducer(errors: ShippingCountryErrorsState = DEFAULT_STATE.errors, action: Action): ShippingCountryErrorsState {
    switch (action.type) {
    case actionTypes.LOAD_SHIPPING_COUNTRIES_REQUESTED:
    case actionTypes.LOAD_SHIPPING_COUNTRIES_SUCCEEDED:
        return { ...errors, loadError: undefined };

    case actionTypes.LOAD_SHIPPING_COUNTRIES_FAILED:
        return { ...errors, loadError: action.payload };

    default:
        return errors;
    }
}

function statusesReducer(statuses: ShippingCountryStatusesState = DEFAULT_STATE.statuses, action: Action): ShippingCountryStatusesState {
    switch (action.type) {
    case actionTypes.LOAD_SHIPPING_COUNTRIES_REQUESTED:
        return { ...statuses, isLoading: true };

    case actionTypes.LOAD_SHIPPING_COUNTRIES_SUCCEEDED:
    case actionTypes.LOAD_SHIPPING_COUNTRIES_FAILED:
        return { ...statuses, isLoading: false };

    default:
        return statuses;
    }
}
