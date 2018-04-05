import { combineReducers } from '@bigcommerce/data-store';

import { PaymentStrategyAction, PaymentStrategyActionType } from './payment-strategy-actions';
import PaymentStrategyState, { DEFAULT_STATE, PaymentStrategyErrorsState, PaymentStrategyStatusesState } from './payment-strategy-state';

export default function paymentStrategyReducer(
    state: PaymentStrategyState = DEFAULT_STATE,
    action: PaymentStrategyAction
): PaymentStrategyState {
    const reducer = combineReducers<PaymentStrategyState, PaymentStrategyAction>({
        errors: errorsReducer,
        statuses: statusesReducer,
    });

    return reducer(state, action);
}

function errorsReducer(
    errors: PaymentStrategyErrorsState = DEFAULT_STATE.errors,
    action: PaymentStrategyAction
): PaymentStrategyErrorsState {
    switch (action.type) {
    case PaymentStrategyActionType.InitializeRequested:
    case PaymentStrategyActionType.InitializeSucceeded:
        return {
            ...errors,
            initializeError: undefined,
            initializeMethodId: undefined,
        };

    case PaymentStrategyActionType.InitializeFailed:
        return {
            ...errors,
            initializeError: action.payload,
            initializeMethodId: action.meta && action.meta.methodId,
        };

    case PaymentStrategyActionType.DeinitializeRequested:
    case PaymentStrategyActionType.DeinitializeSucceeded:
        return {
            ...errors,
            deinitializeError: undefined,
            deinitializeMethodId: undefined,
        };

    case PaymentStrategyActionType.DeinitializeFailed:
        return {
            ...errors,
            deinitializeError: action.payload,
            deinitializeMethodId: action.meta && action.meta.methodId,
        };

    case PaymentStrategyActionType.ExecuteRequested:
    case PaymentStrategyActionType.ExecuteSucceeded:
        return {
            ...errors,
            executeError: undefined,
            executeMethodId: undefined,
        };

    case PaymentStrategyActionType.ExecuteFailed:
        return {
            ...errors,
            executeError: action.payload,
            executeMethodId: action.meta && action.meta.methodId,
        };

    case PaymentStrategyActionType.FinalizeRequested:
    case PaymentStrategyActionType.FinalizeSucceeded:
        return {
            ...errors,
            finalizeError: undefined,
            finalizeMethodId: undefined,
        };

    case PaymentStrategyActionType.FinalizeFailed:
        return {
            ...errors,
            finalizeError: action.payload,
            finalizeMethodId: action.meta && action.meta.methodId,
        };

    default:
        return errors;
    }
}

function statusesReducer(
    statuses: PaymentStrategyStatusesState = DEFAULT_STATE.statuses,
    action: PaymentStrategyAction
): PaymentStrategyStatusesState {
    switch (action.type) {
    case PaymentStrategyActionType.InitializeRequested:
        return {
            ...statuses,
            isInitializing: true,
            initializeMethodId: action.meta && action.meta.methodId,
        };

    case PaymentStrategyActionType.InitializeFailed:
    case PaymentStrategyActionType.InitializeSucceeded:
        return {
            ...statuses,
            isInitializing: false,
            initializeMethodId: undefined,
        };

    case PaymentStrategyActionType.DeinitializeRequested:
        return {
            ...statuses,
            isDeinitializing: true,
            deinitializeMethodId: action.meta && action.meta.methodId,
        };

    case PaymentStrategyActionType.DeinitializeFailed:
    case PaymentStrategyActionType.DeinitializeSucceeded:
        return {
            ...statuses,
            isDeinitializing: false,
            deinitializeMethodId: undefined,
        };

    case PaymentStrategyActionType.ExecuteRequested:
        return {
            ...statuses,
            isExecuting: true,
            executeMethodId: action.meta && action.meta.methodId,
        };

    case PaymentStrategyActionType.ExecuteFailed:
    case PaymentStrategyActionType.ExecuteSucceeded:
        return {
            ...statuses,
            isExecuting: false,
            executeMethodId: undefined,
        };

    case PaymentStrategyActionType.FinalizeRequested:
        return {
            ...statuses,
            isFinalizing: true,
            finalizeMethodId: action.meta && action.meta.methodId,
        };

    case PaymentStrategyActionType.FinalizeFailed:
    case PaymentStrategyActionType.FinalizeSucceeded:
        return {
            ...statuses,
            isFinalizing: false,
            finalizeMethodId: undefined,
        };

    default:
        return statuses;
    }
}
