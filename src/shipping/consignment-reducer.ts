import { combineReducers } from '@bigcommerce/data-store';

import { CheckoutAction, CheckoutActionType } from '../checkout';

import Consignment from './consignment';
import { ConsignmentAction, ConsignmentActionTypes } from './consignment-actions';
import ConsignmentState, { ConsignmentErrorsState, ConsignmentStatusesState } from './consignment-state';

const DEFAULT_STATE: ConsignmentState = {
    errors: {},
    statuses: {},
};

export default function consignmentReducer(
    state: ConsignmentState = DEFAULT_STATE,
    action: ConsignmentAction | CheckoutAction
): ConsignmentState {
    const reducer = combineReducers<ConsignmentState, ConsignmentAction | CheckoutAction>({
        data: dataReducer,
        errors: errorsReducer,
        statuses: statusesReducer,
    });

    return reducer(state, action);
}

function dataReducer(
    data: Consignment[] | undefined,
    action: ConsignmentAction | CheckoutAction
): Consignment[] | undefined {
    switch (action.type) {
    case CheckoutActionType.LoadCheckoutSucceeded:
    case ConsignmentActionTypes.CreateConsignmentsSucceeded:
    case ConsignmentActionTypes.UpdateConsignmentSucceeded:
        return action.payload ? action.payload.consignments : data;

    default:
        return data;
    }
}

function errorsReducer(
    errors: ConsignmentErrorsState = DEFAULT_STATE.errors,
    action: ConsignmentAction | CheckoutAction
): ConsignmentErrorsState {
    switch (action.type) {
    case CheckoutActionType.LoadCheckoutRequested:
    case CheckoutActionType.LoadCheckoutSucceeded:
        return { ...errors, loadError: undefined };

    case CheckoutActionType.LoadCheckoutFailed:
        return { ...errors, loadError: action.payload };

    case ConsignmentActionTypes.CreateConsignmentsRequested:
    case ConsignmentActionTypes.CreateConsignmentsSucceeded:
        return { ...errors, createError: undefined };

    case ConsignmentActionTypes.CreateConsignmentsFailed:
        return { ...errors, createError: action.payload };

    case ConsignmentActionTypes.UpdateConsignmentSucceeded:
    case ConsignmentActionTypes.UpdateConsignmentRequested:
        return { ...errors, updateError: undefined };

    case ConsignmentActionTypes.UpdateConsignmentFailed:
        return { ...errors, updateError: action.payload };

    default:
        return errors;
    }
}

function statusesReducer(
    statuses: ConsignmentStatusesState = DEFAULT_STATE.statuses,
    action: ConsignmentAction | CheckoutAction
): ConsignmentStatusesState {
    switch (action.type) {
    case CheckoutActionType.LoadCheckoutRequested:
        return { ...statuses, isLoading: true };

    case CheckoutActionType.LoadCheckoutSucceeded:
    case CheckoutActionType.LoadCheckoutFailed:
        return { ...statuses, isLoading: false };

    case ConsignmentActionTypes.CreateConsignmentsRequested:
        return { ...statuses, isCreating: true };

    case ConsignmentActionTypes.CreateConsignmentsSucceeded:
    case ConsignmentActionTypes.CreateConsignmentsFailed:
        return { ...statuses, isCreating: false };

    case ConsignmentActionTypes.UpdateConsignmentRequested:
        return { ...statuses, isUpdating: true };

    case ConsignmentActionTypes.UpdateConsignmentSucceeded:
    case ConsignmentActionTypes.UpdateConsignmentFailed:
        return { ...statuses, isUpdating: false };

    default:
        return statuses;
    }
}
