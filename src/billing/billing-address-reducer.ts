import { combineReducers, composeReducers, Action } from '@bigcommerce/data-store';

import { CheckoutAction, CheckoutActionType } from '../checkout';
import { clearErrorReducer } from '../common/error';
import { OrderAction, OrderActionType } from '../order';

import BillingAddress from './billing-address';
import { BillingAddressAction, BillingAddressActionType } from './billing-address-actions';
import BillingAddressState, { BillingAddressErrorsState, BillingAddressStatusesState, DEFAULT_STATE } from './billing-address-state';

export default function billingAddressReducer(
    state: BillingAddressState = DEFAULT_STATE,
    action: Action
): BillingAddressState {
    const reducer = combineReducers<BillingAddressState>({
        data: dataReducer,
        errors: composeReducers(errorsReducer, clearErrorReducer),
        statuses: statusesReducer,
    });

    return reducer(state, action);
}

function dataReducer(
    data: BillingAddress | undefined,
    action: CheckoutAction | BillingAddressAction | OrderAction
): BillingAddress | undefined {
    switch (action.type) {
    case BillingAddressActionType.UpdateBillingAddressSucceeded:
    case BillingAddressActionType.ContinueAsGuestSucceeded:
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

    case BillingAddressActionType.ContinueAsGuestRequested:
    case BillingAddressActionType.ContinueAsGuestSucceeded:
        return { ...errors, continueAsGuestError: undefined };

    case BillingAddressActionType.ContinueAsGuestFailed:
        return { ...errors, continueAsGuestError: action.payload };

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

    case BillingAddressActionType.ContinueAsGuestRequested:
        return { ...statuses, isContinuingAsGuest: true };

    case BillingAddressActionType.ContinueAsGuestFailed:
    case BillingAddressActionType.ContinueAsGuestSucceeded:
        return { ...statuses, isContinuingAsGuest: false };

    default:
        return statuses;
    }
}
