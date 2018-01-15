import * as actionTypes from './payment-method-action-types';
import { combineReducers } from '../../data-store';
import { mergeOrPush } from '../common/utility';

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
            loadMethodError: undefined,
            failedMethod: undefined,
        };

    case actionTypes.LOAD_PAYMENT_METHOD_FAILED:
        return {
            ...errors,
            loadMethodError: action.payload,
            failedMethod: action.meta.methodId,
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

    default:
        return statuses;
    }
}
