import { combineReducers } from '@bigcommerce/data-store';
import { mergeOrPush } from '../common/utility';
import * as actionTypes from './payment-method-action-types';

/**
 * @param {PaymentMethodsState} state
 * @param {Action} action
 * @return {PaymentMethodsState}
 */
export default function paymentMethodReducer(state = {}, action) {
    const reducer = combineReducers({
        data: dataReducer,
        errors: errorsReducer,
        statuses: statusesReducer,
    });

    return reducer(state, action);
}

/**
 * @private
 * @param {?PaymentMethod[]} data
 * @param {Action} action
 * @return {?PaymentMethod[]}
 */
function dataReducer(data, action) {
    switch (action.type) {
    case actionTypes.LOAD_PAYMENT_METHOD_SUCCEEDED:
        return mergeOrPush(data || [], action.payload.paymentMethod, {
            id: action.payload.paymentMethod.id,
            gateway: action.payload.paymentMethod.gateway,
        });

    case actionTypes.LOAD_PAYMENT_METHODS_SUCCEEDED:
        return action.payload.paymentMethods || [];

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
    case actionTypes.LOAD_PAYMENT_METHODS_REQUESTED:
    case actionTypes.LOAD_PAYMENT_METHODS_SUCCEEDED:
        return { ...errors, loadError: undefined };

    case actionTypes.LOAD_PAYMENT_METHODS_FAILED:
        return { ...errors, loadError: action.payload };

    case actionTypes.LOAD_PAYMENT_METHOD_REQUESTED:
    case actionTypes.LOAD_PAYMENT_METHOD_SUCCEEDED:
        return {
            ...errors,
            loadMethod: undefined,
            loadMethodError: undefined,
        };

    case actionTypes.LOAD_PAYMENT_METHOD_FAILED:
        return {
            ...errors,
            loadMethod: action.meta.methodId,
            loadMethodError: action.payload,
        };

    case actionTypes.INITIALIZE_PAYMENT_METHOD_REQUESTED:
    case actionTypes.INITIALIZE_PAYMENT_METHOD_SUCCEEDED:
        return {
            ...errors,
            initializeMethod: undefined,
            initializeError: undefined,
        };

    case actionTypes.INITIALIZE_PAYMENT_METHOD_FAILED:
        return {
            ...errors,
            initializeMethod: action.meta.methodId,
            initializeError: action.payload,
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
    case actionTypes.LOAD_PAYMENT_METHODS_REQUESTED:
        return { ...statuses, isLoading: true };

    case actionTypes.LOAD_PAYMENT_METHODS_SUCCEEDED:
    case actionTypes.LOAD_PAYMENT_METHODS_FAILED:
        return { ...statuses, isLoading: false };

    case actionTypes.LOAD_PAYMENT_METHOD_REQUESTED:
        return {
            ...statuses,
            isLoadingMethod: true,
            loadingMethod: action.meta.methodId,
        };

    case actionTypes.LOAD_PAYMENT_METHOD_SUCCEEDED:
    case actionTypes.LOAD_PAYMENT_METHOD_FAILED:
        return {
            ...statuses,
            isLoadingMethod: false,
            loadingMethod: undefined,
        };

    case actionTypes.INITIALIZE_PAYMENT_METHOD_REQUESTED:
        return {
            ...statuses,
            initializingMethod: action.meta && action.meta.methodId,
            isInitializing: true,
        };

    case actionTypes.INITIALIZE_PAYMENT_METHOD_SUCCEEDED:
    case actionTypes.INITIALIZE_PAYMENT_METHOD_FAILED:
        return {
            ...statuses,
            initializingMethod: undefined,
            isInitializing: false,
        };

    default:
        return statuses;
    }
}
