import { combineReducers, Action } from '@bigcommerce/data-store';

import { mergeOrPush } from '../common/utility';

import PaymentMethod from './payment-method';
import * as actionTypes from './payment-method-action-types';

/**
 * @todo Convert this file into TypeScript properly
 * @param {PaymentMethodsState} state
 * @param {Action} action
 * @return {PaymentMethodsState}
 */
export default function paymentMethodReducer(state: any = {}, action: Action): any {
    const reducer = combineReducers<any>({
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
function dataReducer(data: PaymentMethod[], action: Action): PaymentMethod[] {
    switch (action.type) {
    case actionTypes.LOAD_PAYMENT_METHOD_SUCCEEDED:
        return mergeOrPush(data || [], action.payload.paymentMethod, {
            id: action.payload.paymentMethod.id,
            gateway: action.payload.paymentMethod.gateway,
        } as any);

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
function errorsReducer(errors: any = {}, action: Action): any {
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
