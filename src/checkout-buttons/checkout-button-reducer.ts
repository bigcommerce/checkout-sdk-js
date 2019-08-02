import { combineReducers } from '@bigcommerce/data-store';

import { CheckoutButtonAction, CheckoutButtonActionType } from './checkout-button-actions';
import CheckoutButtonState, { CheckoutButtonDataState, CheckoutButtonErrorsState, CheckoutButtonStatusesState, DEFAULT_STATE } from './checkout-button-state';

const DEFAULT_DATA_STATE: CheckoutButtonDataState = { initializedContainers: {} };
const DEFAULT_ERROR_STATE: CheckoutButtonErrorsState = {};
const DEFAULT_STATUS_STATE: CheckoutButtonStatusesState = {};

export default function checkoutButtonReducer(
    state: CheckoutButtonState = DEFAULT_STATE,
    action: CheckoutButtonAction
): CheckoutButtonState {
    if (!action.meta || !action.meta.methodId) {
        return state;
    }

    const reducer = combineReducers<CheckoutButtonState>({
        data: combineReducers({
            [action.meta.methodId]: dataReducer,
        }),
        errors: combineReducers({
            [action.meta.methodId]: errorsReducer,
        }),
        statuses: combineReducers({
            [action.meta.methodId]: statusesReducer,
        }),
    });

    return reducer(state, action);
}

function dataReducer(
    data: CheckoutButtonDataState = DEFAULT_DATA_STATE,
    action: CheckoutButtonAction
): CheckoutButtonDataState {
    switch (action.type) {
    case CheckoutButtonActionType.InitializeButtonSucceeded:
        if (!action.meta || !action.meta.containerId) {
            return data;
        }

        return {
            ...data,
            initializedContainers: {
                ...data.initializedContainers,
                [action.meta.containerId]: true,
            },
        };

    case CheckoutButtonActionType.DeinitializeButtonSucceeded:
        return {
            ...data,
            initializedContainers: {},
        };
    }

    return data;
}

function errorsReducer(
    errors: CheckoutButtonErrorsState = DEFAULT_ERROR_STATE,
    action: CheckoutButtonAction
): CheckoutButtonErrorsState {
    switch (action.type) {
    case CheckoutButtonActionType.InitializeButtonRequested:
    case CheckoutButtonActionType.InitializeButtonSucceeded:
        return {
            ...errors,
            initializeError: undefined,
        };

    case CheckoutButtonActionType.InitializeButtonFailed:
        return {
            ...errors,
            initializeError: action.payload,
        };

    case CheckoutButtonActionType.DeinitializeButtonRequested:
    case CheckoutButtonActionType.DeinitializeButtonSucceeded:
        return {
            ...errors,
            deinitializeError: undefined,
        };

    case CheckoutButtonActionType.DeinitializeButtonFailed:
        return {
            ...errors,
            deinitializeError: action.payload,
        };

    default:
        return errors;
    }
}

function statusesReducer(
    statuses: CheckoutButtonStatusesState = DEFAULT_STATUS_STATE,
    action: CheckoutButtonAction
): CheckoutButtonStatusesState {
    switch (action.type) {
    case CheckoutButtonActionType.InitializeButtonRequested:
        return {
            ...statuses,
            isInitializing: true,
        };

    case CheckoutButtonActionType.InitializeButtonFailed:
    case CheckoutButtonActionType.InitializeButtonSucceeded:
        return {
            ...statuses,
            isInitializing: false,
        };

    case CheckoutButtonActionType.DeinitializeButtonRequested:
        return {
            ...statuses,
            isDeinitializing: true,
        };

    case CheckoutButtonActionType.DeinitializeButtonFailed:
    case CheckoutButtonActionType.DeinitializeButtonSucceeded:
        return {
            ...statuses,
            isDeinitializing: false,
        };

    default:
        return statuses;
    }
}
