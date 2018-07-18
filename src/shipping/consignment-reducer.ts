import { combineReducers } from '@bigcommerce/data-store';

import { CheckoutAction, CheckoutActionType } from '../checkout';
import { CustomerAction, CustomerActionType } from '../customer';

import Consignment from './consignment';
import { ConsignmentAction, ConsignmentActionType, UpdateConsignmentAction, UpdateShippingOptionAction } from './consignment-actions';
import ConsignmentState, { ConsignmentErrorsState, ConsignmentStatusesState } from './consignment-state';

const DEFAULT_STATE: ConsignmentState = {
    errors: {
        updateShippingOptionError: {},
        updateError: {},
    },
    statuses: {
        isUpdating: {},
        isUpdatingShippingOption: {},
    },
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
    case ConsignmentActionType.UpdateShippingOptionSucceeded:
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
    let meta;

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
        meta = (action as UpdateConsignmentAction).meta;

        if (meta) {
            errors.updateError[meta.id] = undefined;
        }

        return errors;

    case ConsignmentActionType.UpdateConsignmentFailed:
        meta = (action as UpdateConsignmentAction).meta;

        if (meta) {
            errors.updateError[meta.id] = action.payload;
        }

        return errors;

    case ConsignmentActionType.UpdateShippingOptionRequested:
    case ConsignmentActionType.UpdateShippingOptionSucceeded:
        meta = (action as UpdateShippingOptionAction).meta;

        if (meta) {
            errors.updateShippingOptionError[meta.id] = undefined;
        }

        return errors;

    case ConsignmentActionType.UpdateShippingOptionFailed:
        meta = (action as UpdateShippingOptionAction).meta;

        if (meta) {
            errors.updateShippingOptionError[meta.id] = action.payload;
        }

        return errors;

    default:
        return errors;
    }
}

function statusesReducer(
    statuses: ConsignmentStatusesState = DEFAULT_STATE.statuses,
    action: ConsignmentAction | CheckoutAction
): ConsignmentStatusesState {
    let meta;

    switch (action.type) {
    case CheckoutActionType.LoadCheckoutRequested:
        return { ...statuses, isLoading: true };

    case ConsignmentActionType.LoadShippingOptionsRequested:
        return { ...statuses, isLoadingShippingOptions: true };

    case CheckoutActionType.LoadCheckoutSucceeded:
    case CheckoutActionType.LoadCheckoutFailed:
        return { ...statuses, isLoading: false };

    case ConsignmentActionType.LoadShippingOptionsSucceeded:
    case ConsignmentActionType.LoadShippingOptionsFailed:
        return { ...statuses, isLoadingShippingOptions: false };

    case ConsignmentActionType.CreateConsignmentsRequested:
        return { ...statuses, isCreating: true };

    case ConsignmentActionType.CreateConsignmentsSucceeded:
    case ConsignmentActionType.CreateConsignmentsFailed:
        return { ...statuses, isCreating: false };

    case ConsignmentActionType.UpdateConsignmentRequested:
        meta = (action as UpdateConsignmentAction).meta;

        if (meta) {
            statuses.isUpdating[meta.id] = true;
        }

        return statuses;

    case ConsignmentActionType.UpdateConsignmentSucceeded:
    case ConsignmentActionType.UpdateConsignmentFailed:
        meta = (action as UpdateConsignmentAction).meta;

        if (meta) {
            statuses.isUpdating[meta.id] = false;
        }

        return statuses;

    case ConsignmentActionType.UpdateShippingOptionRequested:
        meta = (action as UpdateShippingOptionAction).meta;

        if (meta) {
            statuses.isUpdatingShippingOption[meta.id] = true;
        }

        return statuses;

    case ConsignmentActionType.UpdateShippingOptionSucceeded:
    case ConsignmentActionType.UpdateShippingOptionFailed:
        meta = (action as UpdateShippingOptionAction).meta;

        if (meta) {
            statuses.isUpdatingShippingOption[meta.id] = false;
        }

        return statuses;

    default:
        return statuses;
    }
}
