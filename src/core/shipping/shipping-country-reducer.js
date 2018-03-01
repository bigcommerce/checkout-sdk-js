import { combineReducers } from '@bigcommerce/data-store';
import * as actionTypes from './shipping-country-action-types';

/**
 * @private
 * @param {Country[]} data
 * @param {Action} action
 * @return {Country[]}
 */
function dataReducer(data, action) {
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
function errorsReducer(errors = {}, action) {
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
function statusesReducer(statuses = {}, action) {
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

/**
 * @param {CountriesState} state
 * @param {Action} action
 * @return {CountriesState}
 */
export default function shippingCountryReducer(state = {}, action) {
    const reducer = combineReducers({
        errors: errorsReducer,
        data: dataReducer,
        statuses: statusesReducer,
    });

    return reducer(state, action);
}
