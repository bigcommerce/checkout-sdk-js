import { Action, combineReducers } from '../../data-store';
import * as actionTypes from './shipping-action-types';
import ShippingState, { ShippingErrorsState, ShippingStatusesState } from './shipping-state';

const DEFAULT_STATE: ShippingState = {
    errors: {},
    statuses: {},
};

export default function shippingReducer(
    state: ShippingState = DEFAULT_STATE,
    action: Action
): ShippingState {
    const reducer = combineReducers({
        errors: errorsReducer,
        statuses: statusesReducer,
    });

    return reducer(state, action);
}

function errorsReducer(
    errors: ShippingErrorsState = DEFAULT_STATE.errors,
    action: Action
): ShippingErrorsState {
    switch (action.type) {
    case actionTypes.INITIALIZE_SHIPPING_REQUESTED:
    case actionTypes.INITIALIZE_SHIPPING_SUCCEEDED:
        return {
            ...errors,
            initializeMethod: undefined,
            initializeError: undefined,
        };

    case actionTypes.INITIALIZE_SHIPPING_FAILED:
        return {
            ...errors,
            initializeMethod: action.meta && action.meta.methodId,
            initializeError: action.payload,
        };

    default:
        return errors;
    }
}

function statusesReducer(
    statuses: ShippingStatusesState = DEFAULT_STATE.statuses,
    action: Action
): ShippingStatusesState {
    switch (action.type) {
    case actionTypes.INITIALIZE_SHIPPING_REQUESTED:
        return {
            ...statuses,
            initializingMethod: action.meta && action.meta.methodId,
            isInitializing: true,
        };

    case actionTypes.INITIALIZE_SHIPPING_FAILED:
    case actionTypes.INITIALIZE_SHIPPING_SUCCEEDED:
        return {
            ...statuses,
            initializingMethod: undefined,
            isInitializing: false,
        };

    default:
        return statuses;
    }
}
