import { combineReducers, composeReducers, Action } from '@bigcommerce/data-store';

import { clearErrorReducer } from '../common/error';
import { objectMerge } from '../common/utility';

import { ShippingStrategyAction, ShippingStrategyActionType } from './shipping-strategy-actions';
import ShippingStrategyState, { DEFAULT_STATE, ShippingStrategyDataState, ShippingStrategyErrorsState, ShippingStrategyStatusesState } from './shipping-strategy-state';

export default function shippingStrategyReducer(
    state: ShippingStrategyState = DEFAULT_STATE,
    action: Action
): ShippingStrategyState {
    const reducer = combineReducers<ShippingStrategyState, ShippingStrategyAction>({
        data: dataReducer,
        errors: composeReducers(errorsReducer, clearErrorReducer),
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
        return objectMerge(data, {
            [action.meta && action.meta.methodId]: {
                isInitialized: true,
            },
        });

    case ShippingStrategyActionType.DeinitializeSucceeded:
        return objectMerge(data, {
            [action.meta && action.meta.methodId]: {
                isInitialized: false,
            },
        });
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
        return objectMerge(errors, {
            initializeError: undefined,
            initializeMethodId: undefined,
        });

    case ShippingStrategyActionType.InitializeFailed:
        return objectMerge(errors, {
            initializeError: action.payload,
            initializeMethodId: action.meta && action.meta.methodId,
        });

    case ShippingStrategyActionType.DeinitializeRequested:
    case ShippingStrategyActionType.DeinitializeSucceeded:
        return objectMerge(errors, {
            deinitializeError: undefined,
            deinitializeMethodId: undefined,
        });

    case ShippingStrategyActionType.DeinitializeFailed:
        return objectMerge(errors, {
            deinitializeError: action.payload,
            deinitializeMethodId: action.meta && action.meta.methodId,
        });

    case ShippingStrategyActionType.UpdateAddressRequested:
    case ShippingStrategyActionType.UpdateAddressSucceeded:
        return objectMerge(errors, {
            updateAddressError: undefined,
            updateAddressMethodId: undefined,
        });

    case ShippingStrategyActionType.UpdateAddressFailed:
        return objectMerge(errors, {
            updateAddressError: action.payload,
            updateAddressMethodId: action.meta && action.meta.methodId,
        });

    case ShippingStrategyActionType.SelectOptionRequested:
    case ShippingStrategyActionType.SelectOptionSucceeded:
        return objectMerge(errors, {
            selectOptionError: undefined,
            selectOptionMethodId: undefined,
        });

    case ShippingStrategyActionType.SelectOptionFailed:
        return objectMerge(errors, {
            selectOptionError: action.payload,
            selectOptionMethodId: action.meta && action.meta.methodId,
        });

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
        return objectMerge(statuses, {
            isInitializing: true,
            initializeMethodId: action.meta && action.meta.methodId,
        });

    case ShippingStrategyActionType.InitializeFailed:
    case ShippingStrategyActionType.InitializeSucceeded:
        return objectMerge(statuses, {
            isInitializing: false,
            initializeMethodId: undefined,
        });

    case ShippingStrategyActionType.DeinitializeRequested:
        return objectMerge(statuses, {
            isDeinitializing: true,
            deinitializeMethodId: action.meta && action.meta.methodId,
        });

    case ShippingStrategyActionType.DeinitializeFailed:
    case ShippingStrategyActionType.DeinitializeSucceeded:
        return objectMerge(statuses, {
            isDeinitializing: false,
            deinitializeMethodId: undefined,
        });

    case ShippingStrategyActionType.UpdateAddressRequested:
        return objectMerge(statuses, {
            isUpdatingAddress: true,
            updateAddressMethodId: action.meta && action.meta.methodId,
        });

    case ShippingStrategyActionType.UpdateAddressFailed:
    case ShippingStrategyActionType.UpdateAddressSucceeded:
        return objectMerge(statuses, {
            isUpdatingAddress: false,
            updateAddressMethodId: undefined,
        });

    case ShippingStrategyActionType.SelectOptionRequested:
        return objectMerge(statuses, {
            isSelectingOption: true,
            selectOptionMethodId: action.meta && action.meta.methodId,
        });

    case ShippingStrategyActionType.SelectOptionFailed:
    case ShippingStrategyActionType.SelectOptionSucceeded:
        return objectMerge(statuses, {
            isSelectingOption: false,
            selectOptionMethodId: undefined,
        });

    default:
        return statuses;
    }
}
