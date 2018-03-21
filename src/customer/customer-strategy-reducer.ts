import { combineReducers } from '@bigcommerce/data-store';

import { CustomerStrategyAction, CustomerStrategyActionType } from './customer-strategy-actions';
import CustomerStrategyState, {
    CustomerStrategyErrorsState,
    CustomerStrategyStatusesState,
} from './customer-strategy-state';

const DEFAULT_STATE: CustomerStrategyState = {
    errors: {},
    statuses: {},
};

export default function customerStrategyReducer(
    state: CustomerStrategyState = DEFAULT_STATE,
    action: CustomerStrategyAction
): CustomerStrategyState {
    const reducer = combineReducers<CustomerStrategyState, CustomerStrategyAction>({
        errors: errorsReducer,
        statuses: statusesReducer,
    });

    return reducer(state, action);
}

function errorsReducer(
    errors: CustomerStrategyErrorsState = DEFAULT_STATE.errors,
    action: CustomerStrategyAction
): CustomerStrategyErrorsState {
    switch (action.type) {
    case CustomerStrategyActionType.InitializeRequested:
    case CustomerStrategyActionType.InitializeSucceeded:
        return {
            ...errors,
            initializeError: undefined,
            initializeMethod: undefined,
        };

    case CustomerStrategyActionType.InitializeFailed:
        return {
            ...errors,
            initializeError: action.payload,
            initializeMethod: action.meta && action.meta.methodId,
        };

    case CustomerStrategyActionType.DeinitializeRequested:
    case CustomerStrategyActionType.DeinitializeSucceeded:
        return {
            ...errors,
            deinitializeError: undefined,
            deinitializeMethod: undefined,
        };

    case CustomerStrategyActionType.DeinitializeFailed:
        return {
            ...errors,
            deinitializeError: action.payload,
            deinitializeMethod: action.meta && action.meta.methodId,
        };

    case CustomerStrategyActionType.SignInRequested:
    case CustomerStrategyActionType.SignInSucceeded:
        return {
            ...errors,
            signInError: undefined,
            signInMethod: undefined,
        };

    case CustomerStrategyActionType.SignInFailed:
        return {
            ...errors,
            signInError: action.payload,
            signInMethod: action.meta && action.meta.methodId,
        };

    case CustomerStrategyActionType.SignOutRequested:
    case CustomerStrategyActionType.SignOutSucceeded:
        return {
            ...errors,
            signOutError: undefined,
            signOutMethod: undefined,
        };

    case CustomerStrategyActionType.SignOutFailed:
        return {
            ...errors,
            signOutError: action.payload,
            signOutMethod: action.meta && action.meta.methodId,
        };

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
        return {
            ...statuses,
            isInitializing: true,
            initializingMethod: action.meta && action.meta.methodId,
        };

    case CustomerStrategyActionType.InitializeFailed:
    case CustomerStrategyActionType.InitializeSucceeded:
        return {
            ...statuses,
            isInitializing: false,
            initializingMethod: undefined,
        };

    case CustomerStrategyActionType.DeinitializeRequested:
        return {
            ...statuses,
            isDeinitializing: true,
            deinitializingMethod: action.meta && action.meta.methodId,
        };

    case CustomerStrategyActionType.DeinitializeFailed:
    case CustomerStrategyActionType.DeinitializeSucceeded:
        return {
            ...statuses,
            isDeinitializing: false,
            deinitializingMethod: undefined,
        };

    case CustomerStrategyActionType.SignInRequested:
        return {
            ...statuses,
            isSigningIn: true,
            signingInMethod: action.meta && action.meta.methodId,
        };

    case CustomerStrategyActionType.SignInFailed:
    case CustomerStrategyActionType.SignInSucceeded:
        return {
            ...statuses,
            isSigningIn: false,
            signingInMethod: undefined,
        };

    case CustomerStrategyActionType.SignOutRequested:
        return {
            ...statuses,
            isSigningOut: true,
            signingOutMethod: action.meta && action.meta.methodId,
        };

    case CustomerStrategyActionType.SignOutFailed:
    case CustomerStrategyActionType.SignOutSucceeded:
        return {
            ...statuses,
            isSigningOut: false,
            signingOutMethod: undefined,
        };

    default:
        return statuses;
    }
}
