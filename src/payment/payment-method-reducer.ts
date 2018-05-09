import { combineReducers, Action } from '@bigcommerce/data-store';

import { mergeOrPush } from '../common/utility';

import PaymentMethod from './payment-method';
import * as actionTypes from './payment-method-action-types';
import PaymentMethodState, { PaymentMethodErrorsState, PaymentMethodStatusesState } from './payment-method-state';

const DEFAULT_STATE: PaymentMethodState = {
    errors: {},
    statuses: {},
};

/**
 * @todo Convert this file into TypeScript properly
 * i.e.: Action
 */
export default function paymentMethodReducer(state: PaymentMethodState = DEFAULT_STATE, action: Action): PaymentMethodState {
    const reducer = combineReducers<PaymentMethodState>({
        data: dataReducer,
        errors: errorsReducer,
        statuses: statusesReducer,
    });

    return reducer(state, action);
}

function dataReducer(data: PaymentMethod[] | undefined, action: Action): PaymentMethod[] | undefined {
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

function errorsReducer(errors: PaymentMethodErrorsState = DEFAULT_STATE.errors, action: Action): PaymentMethodErrorsState {
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
            loadMethodId: undefined,
            loadMethodError: undefined,
        };

    case actionTypes.LOAD_PAYMENT_METHOD_FAILED:
        return {
            ...errors,
            loadMethodId: action.meta.methodId,
            loadMethodError: action.payload,
        };

    default:
        return errors;
    }
}

function statusesReducer(statuses: PaymentMethodStatusesState = DEFAULT_STATE.statuses, action: Action): PaymentMethodStatusesState {
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
            loadMethodId: action.meta.methodId,
        };

    case actionTypes.LOAD_PAYMENT_METHOD_SUCCEEDED:
    case actionTypes.LOAD_PAYMENT_METHOD_FAILED:
        return {
            ...statuses,
            isLoadingMethod: false,
            loadMethodId: undefined,
        };

    default:
        return statuses;
    }
}
