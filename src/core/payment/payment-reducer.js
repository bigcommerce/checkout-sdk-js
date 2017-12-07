import * as actionTypes from './payment-action-types';
import { combineReducers } from '../../data-store';

/**
 * @param {PaymentState} state
 * @param {Action} action
 * @return {PaymentState}
 */
export default function paymentReducer(state = {}, action) {
    const reducer = combineReducers({
        data: dataReducer,
        errors: errorsReducer,
        statuses: statusesReducer,
    });

    return reducer(state, action);
}

/**
 * @private
 * @param {PaymentResponseBody} data
 * @param {Action} action
 * @return {PaymentResponseBody}
 */
function dataReducer(data = {}, action) {
    switch (action.type) {
    case actionTypes.SUBMIT_PAYMENT_SUCCEEDED:
        return action.payload;

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
    case actionTypes.SUBMIT_PAYMENT_REQUESTED:
    case actionTypes.SUBMIT_PAYMENT_SUCCEEDED:
        return { ...errors, submitError: undefined };

    case actionTypes.SUBMIT_PAYMENT_FAILED:
        return { ...errors, submitError: action.payload };

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
    case actionTypes.SUBMIT_PAYMENT_REQUESTED:
        return { ...statuses, isSubmitting: true };

    case actionTypes.SUBMIT_PAYMENT_SUCCEEDED:
    case actionTypes.SUBMIT_PAYMENT_FAILED:
        return { ...statuses, isSubmitting: false };

    default:
        return statuses;
    }
}
