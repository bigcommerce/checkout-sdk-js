import { combineReducers, Action } from '@bigcommerce/data-store';

import * as actionTypes from './shipping-country-action-types';

/**
 * @todo Convert this file into TypeScript properly
 * @param {CountriesState} state
 * @param {Action} action
 * @return {CountriesState}
 */
export default function shippingCountryReducer(state: any = {}, action: Action): any {
    const reducer = combineReducers({
        errors: errorsReducer,
        data: dataReducer,
        statuses: statusesReducer,
    });

    return reducer(state, action);
}

/**
 * @private
 * @param {Country[]} data
 * @param {Action} action
 * @return {Country[]}
 */
function dataReducer(data: any, action: Action): any[] {
    switch (action.type) {
    case actionTypes.LOAD_SHIPPING_COUNTRIES_SUCCEEDED:
        return action.payload || [];

    default:
        return data;
    }
}

/**
 * @private
 * @param {Object} errors
 * @param {Action} action
 * @return {Object}
 */
function errorsReducer(errors: any = {}, action: Action): any {
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

/**
 * @private
 * @param {Object} statuses
 * @param {Action} action
 * @return {Object}
 */
function statusesReducer(statuses: any = {}, action: Action): any {
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
