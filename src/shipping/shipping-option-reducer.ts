import { combineReducers } from '@bigcommerce/data-store';

import { CheckoutAction, CheckoutActionType } from '../checkout';
import { CustomerAction, CustomerActionType } from '../customer';
import { ConsignmentAction, ConsignmentActionTypes } from '../shipping/consignment-actions';

import { InternalShippingOptionList, ShippingOptionState } from '.';
import mapToInternalShippingOptions from './map-to-internal-shipping-options';
import { ShippingOptionErrorsState, ShippingOptionStatusesState } from './shipping-option-state';

const DEFAULT_STATE: ShippingOptionState = {
    errors: {},
    statuses: {},
};

export default function shippingOptionReducer(
    state: ShippingOptionState = DEFAULT_STATE,
    action: CheckoutAction | ConsignmentAction | CustomerAction
): ShippingOptionState {
    const reducer = combineReducers<ShippingOptionState>({
        data: dataReducer,
        errors: errorsReducer,
        statuses: statusesReducer,
    });

    return reducer(state, action);
}

function dataReducer(
    data: InternalShippingOptionList | undefined,
    action: CheckoutAction | ConsignmentAction | CustomerAction
): InternalShippingOptionList | undefined {
    switch (action.type) {
    case CheckoutActionType.LoadCheckoutSucceeded:
    case ConsignmentActionTypes.CreateConsignmentsSucceeded:
    case ConsignmentActionTypes.UpdateConsignmentSucceeded:
        return action.payload ? { ...data, ...mapToInternalShippingOptions(action.payload.consignments) } : data;

    case CustomerActionType.SignOutCustomerSucceeded:
        return action.payload ? action.payload.shippingOptions : data;

    default:
        return data;
    }
}

function statusesReducer(
    statuses: ShippingOptionStatusesState = DEFAULT_STATE.statuses,
    action: CheckoutAction
): ShippingOptionStatusesState {
    switch (action.type) {
    case CheckoutActionType.LoadCheckoutRequested:
        return { ...statuses, isLoading: true };

    case CheckoutActionType.LoadCheckoutFailed:
    case CheckoutActionType.LoadCheckoutSucceeded:
        return { ...statuses, isLoading: false };

    default:
        return statuses;
    }
}

function errorsReducer(
    errors: ShippingOptionErrorsState = DEFAULT_STATE.errors,
    action: CheckoutAction
): ShippingOptionErrorsState {
    switch (action.type) {
    case CheckoutActionType.LoadCheckoutRequested:
    case CheckoutActionType.LoadCheckoutSucceeded:
        return { ...errors, loadError: undefined };

    case CheckoutActionType.LoadCheckoutFailed:
        return { ...errors, loadError: action.payload };

    default:
        return errors;
    }
}
