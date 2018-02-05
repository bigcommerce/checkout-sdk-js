import { combineReducers } from '../../data-store';
import * as configActionType from './config-action-types';

/**
 * @param {ConfigState} state
 * @param {Action} action
 * @return {ConfigState}
 */
export default function configReducer(state = {}, action) {
    const reducer = combineReducers({
        data: dataReducer,
        errors: errorsReducer,
        statuses: statusesReducer,
    });

    return reducer(state, action);
}

/**
 * @private
 * @param {?Config} data
 * @param {Action} action
 * @return {?Config}
 */
function dataReducer(data, action) {
    switch (action.type) {
    case configActionType.LOAD_CONFIG_SUCCEEDED:
        return action.payload ? { ...data, ...action.payload } : data;

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
    case configActionType.LOAD_CONFIG_SUCCEEDED:
        return { ...errors, loadError: undefined };

    case configActionType.LOAD_CONFIG_FAILED:
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
    case configActionType.LOAD_CONFIG_REQUESTED:
        return { ...statuses, isLoading: true };

    case configActionType.LOAD_CONFIG_SUCCEEDED:
    case configActionType.LOAD_CONFIG_FAILED:
        return { ...statuses, isLoading: false };

    default:
        return statuses;
    }
}
