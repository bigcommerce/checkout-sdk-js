import { combineReducers } from '@bigcommerce/data-store';

import { CheckoutAction, CheckoutActionType } from '../checkout';
import { CustomerAction, CustomerActionType } from '../customer';

import Consignment from './consignment';
import { ConsignmentAction, ConsignmentActionType } from './consignment-actions';
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
    action: ConsignmentAction | CheckoutAction | CustomerAction
): Consignment[] | undefined {
    switch (action.type) {
    case CheckoutActionType.LoadCheckoutSucceeded:
    case ConsignmentActionType.LoadShippingOptionsSucceeded:
    case ConsignmentActionType.CreateConsignmentsSucceeded:
    case ConsignmentActionType.UpdateConsignmentSucceeded:
        return action.payload ? action.payload.consignments : data;

    case CustomerActionType.SignOutCustomerSucceeded:
        return [];

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
    case ConsignmentActionType.LoadShippingOptionsSucceeded:
    case ConsignmentActionType.LoadShippingOptionsRequested:
        return { ...errors, loadError: undefined };

    case CheckoutActionType.LoadCheckoutFailed:
    case ConsignmentActionType.LoadShippingOptionsFailed:
        return { ...errors, loadError: action.payload };

    case ConsignmentActionType.CreateConsignmentsRequested:
    case ConsignmentActionType.CreateConsignmentsSucceeded:
        return { ...errors, createError: undefined };

    case ConsignmentActionType.CreateConsignmentsFailed:
        return { ...errors, createError: action.payload };

    case ConsignmentActionType.UpdateConsignmentSucceeded:
    case ConsignmentActionType.UpdateConsignmentRequested:
        return { ...errors, updateError: undefined };

    case ConsignmentActionType.UpdateConsignmentFailed:
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
    case ConsignmentActionType.LoadShippingOptionsRequested:
        return { ...statuses, isLoading: true };

    case CheckoutActionType.LoadCheckoutSucceeded:
    case CheckoutActionType.LoadCheckoutFailed:
    case ConsignmentActionType.LoadShippingOptionsSucceeded:
    case ConsignmentActionType.LoadShippingOptionsFailed:
        return { ...statuses, isLoading: false };

    case ConsignmentActionType.CreateConsignmentsRequested:
        return { ...statuses, isCreating: true };

    case ConsignmentActionType.CreateConsignmentsSucceeded:
    case ConsignmentActionType.CreateConsignmentsFailed:
        return { ...statuses, isCreating: false };

    case ConsignmentActionType.UpdateConsignmentRequested:
        return { ...statuses, isUpdating: true };

    case ConsignmentActionType.UpdateConsignmentSucceeded:
    case ConsignmentActionType.UpdateConsignmentFailed:
        return { ...statuses, isUpdating: false };

    default:
        return statuses;
    }
}
