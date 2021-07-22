import { combineReducers, composeReducers, Action } from '@bigcommerce/data-store';

import { clearErrorReducer } from '../common/error';
import { objectMerge } from '../common/utility';

import { CustomerContinueStrategyAction, CustomerContinueStrategyActionType } from './customer-continue-strategy-actions';
import CustomerContinueStrategyState, { CustomerContinueStrategyDataState, CustomerContinueStrategyErrorsState, CustomerContinueStrategyStatusesState, DEFAULT_STATE } from './customer-continue-strategy-state';

export default function customerContinueStrategyReducer(
    state: CustomerContinueStrategyState = DEFAULT_STATE,
    action: Action
): CustomerContinueStrategyState {
    const reducer = combineReducers<CustomerContinueStrategyState, CustomerContinueStrategyAction>({
        data: dataReducer,
        errors: composeReducers(errorsReducer, clearErrorReducer),
        statuses: statusesReducer,
    });

    return reducer(state, action);
}

function dataReducer(
    data: CustomerContinueStrategyDataState = DEFAULT_STATE.data,
    action: CustomerContinueStrategyAction
): CustomerContinueStrategyDataState {
    switch (action.type) {
        case CustomerContinueStrategyActionType.InitializeSucceeded:
            return objectMerge(data, {
                [action.meta && action.meta.methodId]: {
                    isInitialized: true,
                },
            });

        case CustomerContinueStrategyActionType.DeinitializeSucceeded:
            return objectMerge(data, {
                [action.meta && action.meta.methodId]: {
                    isInitialized: false,
                },
            });
    }

    return data;
}

function errorsReducer(
    errors: CustomerContinueStrategyErrorsState = DEFAULT_STATE.errors,
    action: CustomerContinueStrategyAction
): CustomerContinueStrategyErrorsState {
    switch (action.type) {
        case CustomerContinueStrategyActionType.InitializeRequested:
        case CustomerContinueStrategyActionType.InitializeSucceeded:
            return objectMerge(errors, {
                initializeError: undefined,
                initializeMethodId: undefined,
            });

        case CustomerContinueStrategyActionType.InitializeFailed:
            return objectMerge(errors, {
                initializeError: action.payload,
                initializeMethodId: action.meta && action.meta.methodId,
            });

        case CustomerContinueStrategyActionType.DeinitializeRequested:
        case CustomerContinueStrategyActionType.DeinitializeSucceeded:
            return objectMerge(errors, {
                deinitializeError: undefined,
                deinitializeMethodId: undefined,
            });

        case CustomerContinueStrategyActionType.DeinitializeFailed:
            return objectMerge(errors, {
                deinitializeError: action.payload,
                deinitializeMethodId: action.meta && action.meta.methodId,
            });

        case CustomerContinueStrategyActionType.ExecuteBeforeSignInRequested:
        case CustomerContinueStrategyActionType.ExecuteBeforeSignInSucceeded:
            return objectMerge(errors, {
                executeBeforeSignInError: undefined,
                executeBeforeSignInMethodId: undefined,
            });

        case CustomerContinueStrategyActionType.ExecuteBeforeSignInFailed:
            return objectMerge(errors, {
                executeBeforeSignInError: action.payload,
                executeBeforeSignInMethodId: action.meta && action.meta.methodId,
            });

        case CustomerContinueStrategyActionType.ExecuteBeforeSignUpRequested:
        case CustomerContinueStrategyActionType.ExecuteBeforeSignUpSucceeded:
            return objectMerge(errors, {
                executeBeforeSignUpError: undefined,
                executeBeforeSignUpMethodId: undefined,
            });

        case CustomerContinueStrategyActionType.ExecuteBeforeSignUpFailed:
            return objectMerge(errors, {
                executeBeforeSignUpError: action.payload,
                executeBeforeSignUpMethodId: action.meta && action.meta.methodId,
            });

        case CustomerContinueStrategyActionType.ExecuteBeforeContinueAsGuestRequested:
        case CustomerContinueStrategyActionType.ExecuteBeforeContinueAsGuestSucceeded:
            return objectMerge(errors, {
                executeBeforeContinueAsGuestError: undefined,
                executeBeforeContinueAsGuestMethodId: undefined,
            });

        case CustomerContinueStrategyActionType.ExecuteBeforeContinueAsGuestFailed:
            return objectMerge(errors, {
                executeBeforeContinueAsGuestError: action.payload,
                executeBeforeContinueAsGuestMethodId: action.meta && action.meta.methodId,
            });

        default:
            return errors;
    }
}

function statusesReducer(
    statuses: CustomerContinueStrategyStatusesState = DEFAULT_STATE.statuses,
    action: CustomerContinueStrategyAction
): CustomerContinueStrategyStatusesState {
    switch (action.type) {
        case CustomerContinueStrategyActionType.InitializeRequested:
            return objectMerge(statuses, {
                isInitializing: true,
                initializeMethodId: action.meta && action.meta.methodId,
            });

        case CustomerContinueStrategyActionType.InitializeFailed:
        case CustomerContinueStrategyActionType.InitializeSucceeded:
            return objectMerge(statuses, {
                isInitializing: false,
                initializeMethodId: undefined,
            });

        case CustomerContinueStrategyActionType.DeinitializeRequested:
            return objectMerge(statuses, {
                isDeinitializing: true,
                deinitializeMethodId: action.meta && action.meta.methodId,
            });

        case CustomerContinueStrategyActionType.DeinitializeFailed:
        case CustomerContinueStrategyActionType.DeinitializeSucceeded:
            return objectMerge(statuses, {
                isDeinitializing: false,
                deinitializeMethodId: undefined,
            });

        case CustomerContinueStrategyActionType.ExecuteBeforeSignInRequested:
            return objectMerge(statuses, {
                isExecutingBeforeSignIn: true,
                executeBeforeSignInMethodId: action.meta && action.meta.methodId,
            });

        case CustomerContinueStrategyActionType.ExecuteBeforeSignInSucceeded:
        case CustomerContinueStrategyActionType.ExecuteBeforeSignInFailed:
            return objectMerge(statuses, {
                isExecutingBeforeSignIn: false,
                executeBeforeSignInMethodId: undefined,
            });

        case CustomerContinueStrategyActionType.ExecuteBeforeSignUpRequested:
            return objectMerge(statuses, {
                isExecutingBeforeSignUp: true,
                executeBeforeSignUpMethodId: action.meta && action.meta.methodId,
            });

        case CustomerContinueStrategyActionType.ExecuteBeforeSignUpSucceeded:
        case CustomerContinueStrategyActionType.ExecuteBeforeSignUpFailed:
            return objectMerge(statuses, {
                isExecutingBeforeSignUp: false,
                executeBeforeSignUpMethodId: undefined,
            });

        case CustomerContinueStrategyActionType.ExecuteBeforeContinueAsGuestRequested:
            return objectMerge(statuses, {
                isExecutingBeforeContinueAsGuest: true,
                executeBeforeContinueAsGuestMethodId: action.meta && action.meta.methodId,
            });

        case CustomerContinueStrategyActionType.ExecuteBeforeContinueAsGuestSucceeded:
        case CustomerContinueStrategyActionType.ExecuteBeforeContinueAsGuestFailed:
            return objectMerge(statuses, {
                isExecutingBeforeContinueAsGuest: false,
                executeBeforeContinueAsGuestMethodId: undefined,
            });

        default:
            return statuses;
    }
}
