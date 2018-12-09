import { combineReducers } from '@bigcommerce/data-store';

import { ShippingStrategyAction, ShippingStrategyActionType } from './shipping-strategy-actions';
import ShippingStrategyState, { DEFAULT_STATE, ShippingStrategyDataState, ShippingStrategyErrorsState, ShippingStrategyStatusesState } from './shipping-strategy-state';

export default function shippingStrategyReducer(
    state: ShippingStrategyState = DEFAULT_STATE,
    action: ShippingStrategyAction
): ShippingStrategyState {
    const reducer = combineReducers<ShippingStrategyState, ShippingStrategyAction>({
        data: dataReducer,
        errors: errorsReducer,
        statuses: statusesReducer,
    });

    return reducer(state, action);
}

function dataReducer(
    data: ShippingStrategyDataState = DEFAULT_STATE.data,
    action: ShippingStrategyAction
): ShippingStrategyDataState {
    switch (action.type) {
    case ShippingStrategyActionType.InitializeSucceeded:
        return {
            ...data,
            [action.meta && action.meta.methodId]: {
                isInitialized: true,
            },
        };

    case ShippingStrategyActionType.DeinitializeSucceeded:
        return {
            ...data,
            [action.meta && action.meta.methodId]: {
                isInitialized: false,
            },
        };
    }

    return data;
}

function errorsReducer(
    errors: ShippingStrategyErrorsState = DEFAULT_STATE.errors,
    action: ShippingStrategyAction
): ShippingStrategyErrorsState {
    switch (action.type) {
    case ShippingStrategyActionType.InitializeRequested:
    case ShippingStrategyActionType.InitializeSucceeded:
        return {
            ...errors,
            initializeError: undefined,
            initializeMethodId: undefined,
        };

    case ShippingStrategyActionType.InitializeFailed:
        return {
            ...errors,
            initializeError: action.payload,
            initializeMethodId: action.meta && action.meta.methodId,
        };

    case ShippingStrategyActionType.DeinitializeRequested:
    case ShippingStrategyActionType.DeinitializeSucceeded:
        return {
            ...errors,
            deinitializeError: undefined,
            deinitializeMethodId: undefined,
        };

    case ShippingStrategyActionType.DeinitializeFailed:
        return {
            ...errors,
            deinitializeError: action.payload,
            deinitializeMethodId: action.meta && action.meta.methodId,
        };

    case ShippingStrategyActionType.UpdateAddressRequested:
    case ShippingStrategyActionType.UpdateAddressSucceeded:
        return {
            ...errors,
            updateAddressError: undefined,
            updateAddressMethodId: undefined,
        };

    case ShippingStrategyActionType.UpdateAddressFailed:
        return {
            ...errors,
            updateAddressError: action.payload,
            updateAddressMethodId: action.meta && action.meta.methodId,
        };

    case ShippingStrategyActionType.SelectOptionRequested:
    case ShippingStrategyActionType.SelectOptionSucceeded:
        return {
            ...errors,
            selectOptionError: undefined,
            selectOptionMethodId: undefined,
        };

    case ShippingStrategyActionType.SelectOptionFailed:
        return {
            ...errors,
            selectOptionError: action.payload,
            selectOptionMethodId: action.meta && action.meta.methodId,
        };

    default:
        return errors;
    }
}

function statusesReducer(
    statuses: ShippingStrategyStatusesState = DEFAULT_STATE.statuses,
    action: ShippingStrategyAction
): ShippingStrategyStatusesState {
    switch (action.type) {
    case ShippingStrategyActionType.InitializeRequested:
        return {
            ...statuses,
            isInitializing: true,
            initializeMethodId: action.meta && action.meta.methodId,
        };

    case ShippingStrategyActionType.InitializeFailed:
    case ShippingStrategyActionType.InitializeSucceeded:
        return {
            ...statuses,
            isInitializing: false,
            initializeMethodId: undefined,
        };

    case ShippingStrategyActionType.DeinitializeRequested:
        return {
            ...statuses,
            isDeinitializing: true,
            deinitializeMethodId: action.meta && action.meta.methodId,
        };

    case ShippingStrategyActionType.DeinitializeFailed:
    case ShippingStrategyActionType.DeinitializeSucceeded:
        return {
            ...statuses,
            isDeinitializing: false,
            deinitializeMethodId: undefined,
        };

    case ShippingStrategyActionType.UpdateAddressRequested:
        return {
            ...statuses,
            isUpdatingAddress: true,
            updateAddressMethodId: action.meta && action.meta.methodId,
        };

    case ShippingStrategyActionType.UpdateAddressFailed:
    case ShippingStrategyActionType.UpdateAddressSucceeded:
        return {
            ...statuses,
            isUpdatingAddress: false,
            updateAddressMethodId: undefined,
        };

    case ShippingStrategyActionType.SelectOptionRequested:
        return {
            ...statuses,
            isSelectingOption: true,
            selectOptionMethodId: action.meta && action.meta.methodId,
        };

    case ShippingStrategyActionType.SelectOptionFailed:
    case ShippingStrategyActionType.SelectOptionSucceeded:
        return {
            ...statuses,
            isSelectingOption: false,
            selectOptionMethodId: undefined,
        };

    default:
        return statuses;
    }
}
