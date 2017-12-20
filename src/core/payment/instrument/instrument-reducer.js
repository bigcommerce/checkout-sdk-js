import * as actionTypes from './instrument-action-types';
import { combineReducers } from '../../../data-store';

/**
 * @param {InstrumentState} state
 * @param {Action} action
 * @return {InstrumentState}
 */
export default function instrumentReducer(state = {}, action) {
    const reducer = combineReducers({
        data: dataReducer,
        errors: errorsReducer,
        statuses: statusesReducer,
    });

    return reducer(state, action);
}

/**
 * @private
 * @param {Instruments[]} data
 * @param {Action} action
 * @return {Instruments[]}
 */
function dataReducer(data = [], action) {
    switch (action.type) {
    case actionTypes.LOAD_INSTRUMENTS_SUCCEEDED:
        return action.payload.vaulted_instruments || [];
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
    case actionTypes.LOAD_INSTRUMENTS_REQUESTED:
    case actionTypes.LOAD_INSTRUMENTS_SUCCEEDED:
        return { ...errors, loadError: undefined };

    case actionTypes.LOAD_INSTRUMENTS_FAILED:
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
    case actionTypes.LOAD_INSTRUMENTS_REQUESTED:
        return { ...statuses, isLoading: true };

    case actionTypes.LOAD_INSTRUMENTS_SUCCEEDED:
    case actionTypes.LOAD_INSTRUMENTS_FAILED:
        return { ...statuses, isLoading: false };

    default:
        return statuses;
    }
}
