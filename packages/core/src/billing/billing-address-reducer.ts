import { combineReducers, composeReducers, Action } from '@bigcommerce/data-store';

import { CheckoutAction, CheckoutActionType } from '../checkout';
import { clearErrorReducer } from '../common/error';
import { objectSet, replace } from '../common/utility';
import { OrderAction, OrderActionType } from '../order';
import { SubscriptionsActionType, UpdateSubscriptionsAction } from '../subscription';

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
        return replace(data, action.payload && action.payload.billingAddress);

    default:
        return data;
    }
}

function errorsReducer(
    errors: BillingAddressErrorsState = DEFAULT_STATE.errors,
    action: CheckoutAction | BillingAddressAction | OrderAction | UpdateSubscriptionsAction
): BillingAddressErrorsState {
    switch (action.type) {
    case CheckoutActionType.LoadCheckoutRequested:
    case CheckoutActionType.LoadCheckoutSucceeded:
        return objectSet(errors, 'loadError', undefined);

    case CheckoutActionType.LoadCheckoutFailed:
        return objectSet(errors, 'loadError', action.payload);

    case BillingAddressActionType.UpdateBillingAddressRequested:
    case BillingAddressActionType.UpdateBillingAddressSucceeded:
        return objectSet(errors, 'updateError', undefined);

    case BillingAddressActionType.UpdateBillingAddressFailed:
        return objectSet(errors, 'updateError', action.payload);

    case SubscriptionsActionType.UpdateSubscriptionsRequested:
    case SubscriptionsActionType.UpdateSubscriptionsSucceeded:
    case BillingAddressActionType.ContinueAsGuestRequested:
    case BillingAddressActionType.ContinueAsGuestSucceeded:
        return objectSet(errors, 'continueAsGuestError', undefined);

    case SubscriptionsActionType.UpdateSubscriptionsFailed:
    case BillingAddressActionType.ContinueAsGuestFailed:
        return objectSet(errors, 'continueAsGuestError', action.payload);

    default:
        return errors;
    }
}

function statusesReducer(
    statuses: BillingAddressStatusesState = DEFAULT_STATE.statuses,
    action: CheckoutAction | BillingAddressAction | OrderAction | UpdateSubscriptionsAction
): BillingAddressStatusesState {
    switch (action.type) {
    case CheckoutActionType.LoadCheckoutRequested:
        return objectSet(statuses, 'isLoading', true);

    case CheckoutActionType.LoadCheckoutSucceeded:
    case CheckoutActionType.LoadCheckoutFailed:
        return objectSet(statuses, 'isLoading', false);

    case BillingAddressActionType.UpdateBillingAddressRequested:
        return objectSet(statuses, 'isUpdating', true);

    case BillingAddressActionType.UpdateBillingAddressFailed:
    case BillingAddressActionType.UpdateBillingAddressSucceeded:
        return objectSet(statuses, 'isUpdating', false);

    case BillingAddressActionType.ContinueAsGuestRequested:
    case SubscriptionsActionType.UpdateSubscriptionsRequested:
        return objectSet(statuses, 'isContinuingAsGuest', true);

    case SubscriptionsActionType.UpdateSubscriptionsSucceeded:
    case SubscriptionsActionType.UpdateSubscriptionsFailed:
    case BillingAddressActionType.ContinueAsGuestFailed:
    case BillingAddressActionType.ContinueAsGuestSucceeded:
        return objectSet(statuses, 'isContinuingAsGuest', false);

    default:
        return statuses;
    }
}
