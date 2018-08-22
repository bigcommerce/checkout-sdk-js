import { combineReducers, Action } from '@bigcommerce/data-store';

import { mergeOrPush } from '../common/utility';

import PaymentMethod from './payment-method';
import { PaymentMethodAction, PaymentMethodActionType } from './payment-method-actions';
import PaymentMethodMeta from './payment-method-meta';
import PaymentMethodState, { PaymentMethodErrorsState, PaymentMethodStatusesState } from './payment-method-state';

const DEFAULT_STATE: PaymentMethodState = {
    errors: {},
    statuses: {},
};

export default function paymentMethodReducer(
    state: PaymentMethodState = DEFAULT_STATE,
    action: Action
): PaymentMethodState {
    const reducer = combineReducers<PaymentMethodState>({
        data: dataReducer,
        errors: errorsReducer,
        meta: metaReducer,
        statuses: statusesReducer,
    });

    return reducer(state, action);
}

function dataReducer(
    data: PaymentMethod[] | undefined,
    action: PaymentMethodAction
): PaymentMethod[] | undefined {
    switch (action.type) {
    case PaymentMethodActionType.LoadPaymentMethodSucceeded:
        return action.payload ?
            mergeOrPush(data || [], action.payload, {
                id: action.payload.id,
                gateway: action.payload.gateway,
            }) :
            data;

    case PaymentMethodActionType.LoadPaymentMethodsSucceeded:
        return action.payload ? action.payload : [];

    default:
        return data;
    }
}

function metaReducer(
    meta: PaymentMethodMeta | undefined,
    action: PaymentMethodAction
): PaymentMethodMeta | undefined {
    switch (action.type) {
    case PaymentMethodActionType.LoadPaymentMethodsSucceeded:
        return action.meta ? { ...meta, ...action.meta } : meta;

    default:
        return meta;
    }
}

function errorsReducer(
    errors: PaymentMethodErrorsState = DEFAULT_STATE.errors,
    action: PaymentMethodAction
): PaymentMethodErrorsState {
    switch (action.type) {
    case PaymentMethodActionType.LoadPaymentMethodsRequested:
    case PaymentMethodActionType.LoadPaymentMethodsSucceeded:
        return { ...errors, loadError: undefined };

    case PaymentMethodActionType.LoadPaymentMethodsFailed:
        return { ...errors, loadError: action.payload };

    case PaymentMethodActionType.LoadPaymentMethodRequested:
    case PaymentMethodActionType.LoadPaymentMethodSucceeded:
        return {
            ...errors,
            loadMethodId: undefined,
            loadMethodError: undefined,
        };

    case PaymentMethodActionType.LoadPaymentMethodFailed:
        return {
            ...errors,
            loadMethodId: action.meta.methodId,
            loadMethodError: action.payload,
        };

    default:
        return errors;
    }
}

function statusesReducer(
    statuses: PaymentMethodStatusesState = DEFAULT_STATE.statuses,
    action: PaymentMethodAction
): PaymentMethodStatusesState {
    switch (action.type) {
    case PaymentMethodActionType.LoadPaymentMethodsRequested:
        return { ...statuses, isLoading: true };

    case PaymentMethodActionType.LoadPaymentMethodsSucceeded:
    case PaymentMethodActionType.LoadPaymentMethodsFailed:
        return { ...statuses, isLoading: false };

    case PaymentMethodActionType.LoadPaymentMethodRequested:
        return {
            ...statuses,
            isLoadingMethod: true,
            loadMethodId: action.meta.methodId,
        };

    case PaymentMethodActionType.LoadPaymentMethodSucceeded:
    case PaymentMethodActionType.LoadPaymentMethodFailed:
        return {
            ...statuses,
            isLoadingMethod: false,
            loadMethodId: undefined,
        };

    default:
        return statuses;
    }
}
