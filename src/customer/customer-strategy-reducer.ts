import { combineReducers, composeReducers, Action } from '@bigcommerce/data-store';

import { clearErrorReducer } from '../common/error';
import { objectMerge } from '../common/utility';

import { CustomerStrategyAction, CustomerStrategyActionType } from './customer-strategy-actions';
import CustomerStrategyState, { CustomerStrategyDataState, CustomerStrategyErrorsState, CustomerStrategyStatusesState, DEFAULT_STATE } from './customer-strategy-state';

export default function customerStrategyReducer(
    state: CustomerStrategyState = DEFAULT_STATE,
    action: Action
): CustomerStrategyState {
    const reducer = combineReducers<CustomerStrategyState, CustomerStrategyAction>({
        data: dataReducer,
        errors: composeReducers(errorsReducer, clearErrorReducer),
        statuses: statusesReducer,
    });

    return reducer(state, action);
}

function dataReducer(
    data: CustomerStrategyDataState = DEFAULT_STATE.data,
    action: CustomerStrategyAction
): CustomerStrategyDataState {
    switch (action.type) {
    case CustomerStrategyActionType.InitializeSucceeded:
        return objectMerge(data, {
            [action.meta && action.meta.methodId]: {
                isInitialized: true,
            },
        });

    case CustomerStrategyActionType.DeinitializeSucceeded:
        return objectMerge(data, {
            [action.meta && action.meta.methodId]: {
                isInitialized: false,
            },
        });
    }

    return data;
}

function errorsReducer(
    errors: CustomerStrategyErrorsState = DEFAULT_STATE.errors,
    action: CustomerStrategyAction
): CustomerStrategyErrorsState {
    switch (action.type) {
    case CustomerStrategyActionType.InitializeRequested:
    case CustomerStrategyActionType.InitializeSucceeded:
        return objectMerge(errors, {
            initializeError: undefined,
            initializeMethodId: undefined,
        });

    case CustomerStrategyActionType.InitializeFailed:
        return objectMerge(errors, {
            initializeError: action.payload,
            initializeMethodId: action.meta && action.meta.methodId,
        });

    case CustomerStrategyActionType.DeinitializeRequested:
    case CustomerStrategyActionType.DeinitializeSucceeded:
        return objectMerge(errors, {
            deinitializeError: undefined,
            deinitializeMethodId: undefined,
        });

    case CustomerStrategyActionType.DeinitializeFailed:
        return objectMerge(errors, {
            deinitializeError: action.payload,
            deinitializeMethodId: action.meta && action.meta.methodId,
        });

    case CustomerStrategyActionType.SignInRequested:
    case CustomerStrategyActionType.SignInSucceeded:
        return objectMerge(errors, {
            signInError: undefined,
            signInMethodId: undefined,
        });

    case CustomerStrategyActionType.SignInFailed:
        return objectMerge(errors, {
            signInError: action.payload,
            signInMethodId: action.meta && action.meta.methodId,
        });

    case CustomerStrategyActionType.SignOutRequested:
    case CustomerStrategyActionType.SignOutSucceeded:
        return objectMerge(errors, {
            signOutError: undefined,
            signOutMethodId: undefined,
        });

    case CustomerStrategyActionType.SignOutFailed:
        return objectMerge(errors, {
            signOutError: action.payload,
            signOutMethodId: action.meta && action.meta.methodId,
        });

    case CustomerStrategyActionType.WidgetInteractionStarted:
    case CustomerStrategyActionType.WidgetInteractionFinished:
        return objectMerge(errors, {
            widgetInteractionError: undefined,
            widgetInteractionMethodId: undefined,
        });

    case CustomerStrategyActionType.WidgetInteractionFailed:
        return objectMerge(errors, {
            widgetInteractionError: action.payload,
            widgetInteractionMethodId: action.meta.methodId,
        });

    default:
        return errors;
    }
}

function statusesReducer(
    statuses: CustomerStrategyStatusesState = DEFAULT_STATE.statuses,
    action: CustomerStrategyAction
): CustomerStrategyStatusesState {
    switch (action.type) {
    case CustomerStrategyActionType.InitializeRequested:
        return objectMerge(statuses, {
            isInitializing: true,
            initializeMethodId: action.meta && action.meta.methodId,
        });

    case CustomerStrategyActionType.InitializeFailed:
    case CustomerStrategyActionType.InitializeSucceeded:
        return objectMerge(statuses, {
            isInitializing: false,
            initializeMethodId: undefined,
        });

    case CustomerStrategyActionType.DeinitializeRequested:
        return objectMerge(statuses, {
            isDeinitializing: true,
            deinitializeMethodId: action.meta && action.meta.methodId,
        });

    case CustomerStrategyActionType.DeinitializeFailed:
    case CustomerStrategyActionType.DeinitializeSucceeded:
        return objectMerge(statuses, {
            isDeinitializing: false,
            deinitializeMethodId: undefined,
        });

    case CustomerStrategyActionType.SignInRequested:
        return objectMerge(statuses, {
            isSigningIn: true,
            signInMethodId: action.meta && action.meta.methodId,
        });

    case CustomerStrategyActionType.SignInFailed:
    case CustomerStrategyActionType.SignInSucceeded:
        return objectMerge(statuses, {
            isSigningIn: false,
            signInMethodId: undefined,
        });

    case CustomerStrategyActionType.SignOutRequested:
        return objectMerge(statuses, {
            isSigningOut: true,
            signOutMethodId: action.meta && action.meta.methodId,
        });

    case CustomerStrategyActionType.SignOutFailed:
    case CustomerStrategyActionType.SignOutSucceeded:
        return objectMerge(statuses, {
            isSigningOut: false,
            signOutMethodId: undefined,
        });

    case CustomerStrategyActionType.WidgetInteractionStarted:
        return objectMerge(statuses, {
            isWidgetInteracting: true,
            widgetInteractionMethodId: action.meta.methodId,
         });

    case CustomerStrategyActionType.WidgetInteractionFinished:
    case CustomerStrategyActionType.WidgetInteractionFailed:
        return objectMerge(statuses, {
            isWidgetInteracting: false,
            widgetInteractionMethodId: undefined,
         });

    default:
        return statuses;
    }
}
