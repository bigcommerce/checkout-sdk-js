import * as customerActionTypes from '../customer/customer-action-types';
import * as orderActionTypes from '../order/order-action-types';
import * as quoteActionTypes from '../quote/quote-action-types';
import { combineReducers } from '../../data-store';

/**
 * @param {CustomerState} state
 * @param {Action} action
 * @return {CustomerState}
 */
export default function customerReducer(state = {}, action) {
    const reducer = combineReducers({
        data: dataReducer,
        errors: errorsReducer,
        statuses: statusesReducer,
    });

    return reducer(state, action);
}

/**
 * @private
 * @param {?Customer} data
 * @param {Action} action
 * @return {?Customer}
 */
function dataReducer(data, action) {
    switch (action.type) {
    case customerActionTypes.SIGN_IN_CUSTOMER_SUCCEEDED:
    case customerActionTypes.SIGN_OUT_CUSTOMER_SUCCEEDED:
    case orderActionTypes.LOAD_ORDER_SUCCEEDED:
    case orderActionTypes.FINALIZE_ORDER_SUCCEEDED:
    case orderActionTypes.SUBMIT_ORDER_SUCCEEDED:
    case quoteActionTypes.LOAD_QUOTE_SUCCEEDED:
        return action.payload ? { ...data, ...action.payload.customer } : data;

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
    case customerActionTypes.SIGN_IN_CUSTOMER_REQUESTED:
    case customerActionTypes.SIGN_IN_CUSTOMER_SUCCEEDED:
        return { ...errors, signInError: undefined };

    case customerActionTypes.SIGN_IN_CUSTOMER_FAILED:
        return { ...errors, signInError: action.payload };

    case customerActionTypes.SIGN_OUT_CUSTOMER_REQUESTED:
    case customerActionTypes.SIGN_OUT_CUSTOMER_SUCCEEDED:
        return { ...errors, signOutError: undefined };

    case customerActionTypes.SIGN_OUT_CUSTOMER_FAILED:
        return { ...errors, signOutError: action.payload };

    case customerActionTypes.INITIALIZE_CUSTOMER_REQUESTED:
    case customerActionTypes.INITIALIZE_CUSTOMER_SUCCEEDED:
        return {
            ...errors,
            initializeError: undefined,
            initializeMethod: undefined,
        };

    case customerActionTypes.INITIALIZE_CUSTOMER_FAILED:
        return {
            ...errors,
            initializeError: action.payload,
            initializeMethod: action.meta && action.meta.methodId,
        };

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
    case customerActionTypes.SIGN_IN_CUSTOMER_REQUESTED:
        return { ...statuses, isSigningIn: true };

    case customerActionTypes.SIGN_IN_CUSTOMER_SUCCEEDED:
    case customerActionTypes.SIGN_IN_CUSTOMER_FAILED:
        return { ...statuses, isSigningIn: false };

    case customerActionTypes.SIGN_OUT_CUSTOMER_REQUESTED:
        return { ...statuses, isSigningOut: true };

    case customerActionTypes.SIGN_OUT_CUSTOMER_SUCCEEDED:
    case customerActionTypes.SIGN_OUT_CUSTOMER_FAILED:
        return { ...statuses, isSigningOut: false };

    case customerActionTypes.INITIALIZE_CUSTOMER_REQUESTED:
        return {
            ...statuses,
            initializingMethod: action.meta && action.meta.methodId,
            isInitializing: true,
        };

    case customerActionTypes.INITIALIZE_CUSTOMER_SUCCEEDED:
    case customerActionTypes.INITIALIZE_CUSTOMER_FAILED:
        return {
            ...statuses,
            initializingMethod: undefined,
            isInitializing: false,
        };

    default:
        return statuses;
    }
}
