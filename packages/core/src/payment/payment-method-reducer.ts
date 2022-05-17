import { combineReducers, composeReducers, Action } from '@bigcommerce/data-store';

import { clearErrorReducer } from '../common/error';
import { arrayReplace, mergeOrPush, objectMerge, objectSet } from '../common/utility';

import PaymentMethod from './payment-method';
import { PaymentMethodAction, PaymentMethodActionType } from './payment-method-actions';
import PaymentMethodMeta from './payment-method-meta';
import PaymentMethodState, { DEFAULT_STATE, PaymentMethodErrorsState, PaymentMethodStatusesState } from './payment-method-state';

export default function paymentMethodReducer(
    state: PaymentMethodState = DEFAULT_STATE,
    action: Action
): PaymentMethodState {
    const reducer = combineReducers<PaymentMethodState>({
        data: dataReducer,
        errors: composeReducers(errorsReducer, clearErrorReducer),
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
        return mergeOrPush(data || [], action.payload, action.payload && {
            id: action.payload.id,
            gateway: action.payload.gateway,
        });

    case PaymentMethodActionType.LoadPaymentMethodsSucceeded:
        return arrayReplace(data, action.payload, {
            matchObject: (methodA, methodB) => (
                methodA.id === methodB.id && methodA.gateway === methodB.gateway
            ),
        });

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
        return objectMerge(meta, action.meta);

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
        return objectSet(errors, 'loadError', undefined);

    case PaymentMethodActionType.LoadPaymentMethodsFailed:
        return objectSet(errors, 'loadError', action.payload);

    case PaymentMethodActionType.LoadPaymentMethodRequested:
    case PaymentMethodActionType.LoadPaymentMethodSucceeded:
        return objectMerge(errors, {
            loadMethodId: undefined,
            loadMethodError: undefined,
        });

    case PaymentMethodActionType.LoadPaymentMethodFailed:
        return objectMerge(errors, {
            loadMethodId: action.meta.methodId,
            loadMethodError: action.payload,
        });

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
        return objectSet(statuses, 'isLoading', true);

    case PaymentMethodActionType.LoadPaymentMethodsSucceeded:
    case PaymentMethodActionType.LoadPaymentMethodsFailed:
        return objectSet(statuses, 'isLoading', false);

    case PaymentMethodActionType.LoadPaymentMethodRequested:
        return objectMerge(statuses, {
            isLoadingMethod: true,
            loadMethodId: action.meta.methodId,
        });

    case PaymentMethodActionType.LoadPaymentMethodSucceeded:
    case PaymentMethodActionType.LoadPaymentMethodFailed:
        return objectMerge(statuses, {
            isLoadingMethod: false,
            loadMethodId: undefined,
        });

    default:
        return statuses;
    }
}
