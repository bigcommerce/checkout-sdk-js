import { combineReducers, composeReducers, Action } from '@bigcommerce/data-store';

import { clearErrorReducer } from '../common/error';
import { objectMerge } from '../common/utility';

import { PaymentStrategyAction, PaymentStrategyActionType } from './payment-strategy-actions';
import PaymentStrategyState, { DEFAULT_STATE, PaymentStrategyDataState, PaymentStrategyErrorsState, PaymentStrategyStatusesState } from './payment-strategy-state';

export default function paymentStrategyReducer(
    state: PaymentStrategyState = DEFAULT_STATE,
    action: Action
): PaymentStrategyState {
    const reducer = combineReducers<PaymentStrategyState, PaymentStrategyAction>({
        data: dataReducer,
        errors: composeReducers(errorsReducer, clearErrorReducer),
        statuses: statusesReducer,
    });

    return reducer(state, action);
}

function dataReducer(
    data: PaymentStrategyDataState = DEFAULT_STATE.data,
    action: PaymentStrategyAction
): PaymentStrategyDataState {
    switch (action.type) {
    case PaymentStrategyActionType.InitializeSucceeded:
        return objectMerge(data, {
            [action.meta && action.meta.methodId]: {
                isInitialized: true,
            },
        });

    case PaymentStrategyActionType.DeinitializeSucceeded:
        return objectMerge(data, {
            [action.meta && action.meta.methodId]: {
                isInitialized: false,
            },
        });
    }

    return data;
}

function errorsReducer(
    errors: PaymentStrategyErrorsState = DEFAULT_STATE.errors,
    action: PaymentStrategyAction
): PaymentStrategyErrorsState {
    switch (action.type) {
    case PaymentStrategyActionType.InitializeRequested:
    case PaymentStrategyActionType.InitializeSucceeded:
        return objectMerge(errors, {
            initializeError: undefined,
            initializeMethodId: undefined,
        });

    case PaymentStrategyActionType.InitializeFailed:
        return objectMerge(errors, {
            initializeError: action.payload,
            initializeMethodId: action.meta && action.meta.methodId,
        });

    case PaymentStrategyActionType.DeinitializeRequested:
    case PaymentStrategyActionType.DeinitializeSucceeded:
        return objectMerge(errors, {
            deinitializeError: undefined,
            deinitializeMethodId: undefined,
        });

    case PaymentStrategyActionType.DeinitializeFailed:
        return objectMerge(errors, {
            deinitializeError: action.payload,
            deinitializeMethodId: action.meta && action.meta.methodId,
        });

    case PaymentStrategyActionType.ExecuteRequested:
    case PaymentStrategyActionType.ExecuteSucceeded:
        return objectMerge(errors, {
            executeError: undefined,
            executeMethodId: undefined,
        });

    case PaymentStrategyActionType.ExecuteFailed:
        return objectMerge(errors, {
            executeError: action.payload,
            executeMethodId: action.meta && action.meta.methodId,
        });

    case PaymentStrategyActionType.FinalizeRequested:
    case PaymentStrategyActionType.FinalizeSucceeded:
        return objectMerge(errors, {
            finalizeError: undefined,
            finalizeMethodId: undefined,
        });

    case PaymentStrategyActionType.FinalizeFailed:
        return objectMerge(errors, {
            finalizeError: action.payload,
            finalizeMethodId: action.meta && action.meta.methodId,
        });

    case PaymentStrategyActionType.WidgetInteractionStarted:
    case PaymentStrategyActionType.WidgetInteractionFinished:
        return objectMerge(errors, {
            widgetInteractionError: undefined,
            widgetInteractionMethodId: undefined,
        });

    case PaymentStrategyActionType.WidgetInteractionFailed:
        return objectMerge(errors, {
            widgetInteractionError: action.payload,
            widgetInteractionMethodId: action.meta.methodId,
        });

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
        return objectMerge(statuses, {
            isInitializing: true,
            initializeMethodId: action.meta && action.meta.methodId,
        });

    case PaymentStrategyActionType.InitializeFailed:
    case PaymentStrategyActionType.InitializeSucceeded:
        return objectMerge(statuses, {
            isInitializing: false,
            initializeMethodId: undefined,
        });

    case PaymentStrategyActionType.DeinitializeRequested:
        return objectMerge(statuses, {
            isDeinitializing: true,
            deinitializeMethodId: action.meta && action.meta.methodId,
        });

    case PaymentStrategyActionType.DeinitializeFailed:
    case PaymentStrategyActionType.DeinitializeSucceeded:
        return objectMerge(statuses, {
            isDeinitializing: false,
            deinitializeMethodId: undefined,
        });

    case PaymentStrategyActionType.ExecuteRequested:
        return objectMerge(statuses, {
            isExecuting: true,
            executeMethodId: action.meta && action.meta.methodId,
        });

    case PaymentStrategyActionType.ExecuteFailed:
    case PaymentStrategyActionType.ExecuteSucceeded:
        return objectMerge(statuses, {
            isExecuting: false,
            executeMethodId: undefined,
        });

    case PaymentStrategyActionType.FinalizeRequested:
        return objectMerge(statuses, {
            isFinalizing: true,
            finalizeMethodId: action.meta && action.meta.methodId,
        });

    case PaymentStrategyActionType.FinalizeFailed:
    case PaymentStrategyActionType.FinalizeSucceeded:
        return objectMerge(statuses, {
            isFinalizing: false,
            finalizeMethodId: undefined,
        });

    case PaymentStrategyActionType.WidgetInteractionStarted:
        return objectMerge(statuses, {
            isWidgetInteracting: true,
            widgetInteractionMethodId: action.meta.methodId,
        });

    case PaymentStrategyActionType.WidgetInteractionFinished:
    case PaymentStrategyActionType.WidgetInteractionFailed:
        return objectMerge(statuses, {
            isWidgetInteracting: false,
            widgetInteractionMethodId: undefined,
        });

    case PaymentStrategyActionType.EmbeddedSubmitButtonStarted:
        return objectMerge(statuses, {
            isEmbeddedSubmitButton: true,
            embeddedSubmitButtonMethodId: action.meta.methodId,
        });

    case PaymentStrategyActionType.EmbeddedSubmitButtonFinished:
        return objectMerge(statuses, {
            isEmbeddedSubmitButton: false,
            embeddedSubmitButtonMethodId: undefined,
        });

    default:
        return statuses;
    }
}
