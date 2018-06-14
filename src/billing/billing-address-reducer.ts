import { combineReducers } from '@bigcommerce/data-store';

import { Address } from '../address';
import { CheckoutAction, CheckoutActionType } from '../checkout';

import { BillingAddressAction, BillingAddressActionTypes } from './billing-address-actions';
import BillingAddressState, { BillingAddressErrorsState, BillingAddressStatusesState } from './billing-address-state';

const DEFAULT_STATE: BillingAddressState = {
    errors: {},
    statuses: {},
};

export default function billingAddressReducer(
    state: BillingAddressState = DEFAULT_STATE,
    action: CheckoutAction
): BillingAddressState {
    const reducer = combineReducers<BillingAddressState, CheckoutAction | BillingAddressAction>({
        data: dataReducer,
        errors: errorsReducer,
        statuses: statusesReducer,
    });

    return reducer(state, action);
}

function dataReducer(
    data: Address | undefined,
    action: CheckoutAction | BillingAddressAction
): Address | undefined {
    switch (action.type) {
    case BillingAddressActionTypes.UpdateBillingAddressSucceeded:
    case CheckoutActionType.LoadCheckoutSucceeded:
        return action.payload ? action.payload.billingAddress : data;

    default:
        return data;
    }
}

function errorsReducer(
    errors: BillingAddressErrorsState = DEFAULT_STATE.errors,
    action: CheckoutAction | BillingAddressAction
): BillingAddressErrorsState {
    switch (action.type) {
    case CheckoutActionType.LoadCheckoutRequested:
    case CheckoutActionType.LoadCheckoutSucceeded:
        return { ...errors, loadError: undefined };

    case CheckoutActionType.LoadCheckoutFailed:
        return { ...errors, loadError: action.payload };

    case BillingAddressActionTypes.UpdateBillingAddressRequested:
    case BillingAddressActionTypes.UpdateBillingAddressSucceeded:
        return { ...errors, updateError: undefined };

    case BillingAddressActionTypes.UpdateBillingAddressFailed:
        return { ...errors, updateError: action.payload };

    default:
        return errors;
    }
}

function statusesReducer(
    statuses: BillingAddressStatusesState = DEFAULT_STATE.statuses,
    action: CheckoutAction | BillingAddressAction
): BillingAddressStatusesState {
    switch (action.type) {
    case CheckoutActionType.LoadCheckoutRequested:
        return { ...statuses, isLoading: true };

    case CheckoutActionType.LoadCheckoutSucceeded:
    case CheckoutActionType.LoadCheckoutFailed:
        return { ...statuses, isLoading: false };

    case BillingAddressActionTypes.UpdateBillingAddressRequested:
        return { ...statuses, isUpdating: true };

    case BillingAddressActionTypes.UpdateBillingAddressFailed:
    case BillingAddressActionTypes.UpdateBillingAddressSucceeded:
        return { ...statuses, isUpdating: false };

    default:
        return statuses;
    }
}
