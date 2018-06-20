import { combineReducers } from '@bigcommerce/data-store';

import { Address } from '../address';
import { CheckoutAction, CheckoutActionType } from '../checkout';
import { OrderAction, OrderActionType } from '../order';

import { BillingAddressAction, BillingAddressActionType } from './billing-address-actions';
import BillingAddressState, { BillingAddressErrorsState, BillingAddressStatusesState } from './billing-address-state';

const DEFAULT_STATE: BillingAddressState = {
    errors: {},
    statuses: {},
};

export default function billingAddressReducer(
    state: BillingAddressState = DEFAULT_STATE,
    action: CheckoutAction | BillingAddressAction | OrderAction
): BillingAddressState {
    const reducer = combineReducers<BillingAddressState, CheckoutAction | BillingAddressAction | OrderAction>({
        data: dataReducer,
        errors: errorsReducer,
        statuses: statusesReducer,
    });

    return reducer(state, action);
}

function dataReducer(
    data: Address | undefined,
    action: CheckoutAction | BillingAddressAction | OrderAction
): Address | undefined {
    switch (action.type) {
    case BillingAddressActionType.UpdateBillingAddressSucceeded:
    case CheckoutActionType.LoadCheckoutSucceeded:
    case OrderActionType.LoadOrderSucceeded:
        return action.payload ? action.payload.billingAddress : data;

    default:
        return data;
    }
}

function errorsReducer(
    errors: BillingAddressErrorsState = DEFAULT_STATE.errors,
    action: CheckoutAction | BillingAddressAction | OrderAction
): BillingAddressErrorsState {
    switch (action.type) {
    case CheckoutActionType.LoadCheckoutRequested:
    case CheckoutActionType.LoadCheckoutSucceeded:
        return { ...errors, loadError: undefined };

    case CheckoutActionType.LoadCheckoutFailed:
        return { ...errors, loadError: action.payload };

    case BillingAddressActionType.UpdateBillingAddressRequested:
    case BillingAddressActionType.UpdateBillingAddressSucceeded:
        return { ...errors, updateError: undefined };

    case BillingAddressActionType.UpdateBillingAddressFailed:
        return { ...errors, updateError: action.payload };

    default:
        return errors;
    }
}

function statusesReducer(
    statuses: BillingAddressStatusesState = DEFAULT_STATE.statuses,
    action: CheckoutAction | BillingAddressAction | OrderAction
): BillingAddressStatusesState {
    switch (action.type) {
    case CheckoutActionType.LoadCheckoutRequested:
        return { ...statuses, isLoading: true };

    case CheckoutActionType.LoadCheckoutSucceeded:
    case CheckoutActionType.LoadCheckoutFailed:
        return { ...statuses, isLoading: false };

    case BillingAddressActionType.UpdateBillingAddressRequested:
        return { ...statuses, isUpdating: true };

    case BillingAddressActionType.UpdateBillingAddressFailed:
    case BillingAddressActionType.UpdateBillingAddressSucceeded:
        return { ...statuses, isUpdating: false };

    default:
        return statuses;
    }
}
