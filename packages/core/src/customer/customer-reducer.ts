import { combineReducers, composeReducers } from '@bigcommerce/data-store';

import { BillingAddressActionType, ContinueAsGuestAction } from '../billing';
import { CheckoutAction, CheckoutActionType } from '../checkout';
import { clearErrorReducer } from '../common/error';
import { objectMerge, objectSet } from '../common/utility';

import Customer from './customer';
import {
    CustomerAction,
    CustomerActionType,
    StripeLinkAuthenticatedAction,
    PayPalConnectAuthenticatedAction,
    PayPalConnectCanceledAction,
} from './customer-actions';
import CustomerState, {
    CustomerErrorsState,
    CustomerStatusesState,
    DEFAULT_STATE,
} from './customer-state';

type ReducerActionType =
    | CheckoutAction
    | ContinueAsGuestAction
    | CustomerAction
    | PayPalConnectAuthenticatedAction
    | PayPalConnectCanceledAction
    | StripeLinkAuthenticatedAction;

export default function customerReducer(
    state: CustomerState = DEFAULT_STATE,
    action: ReducerActionType,
): CustomerState {
    const reducer = combineReducers<CustomerState, ReducerActionType>({
        data: dataReducer,
        errors: composeReducers(errorsReducer, clearErrorReducer),
        statuses: statusesReducer,
    });

    return reducer(state, action);
}

function dataReducer(data: Customer | undefined, action: ReducerActionType): Customer | undefined {
    switch (action.type) {
        case BillingAddressActionType.ContinueAsGuestSucceeded:
        case CheckoutActionType.LoadCheckoutSucceeded:
            return objectMerge(data, action.payload && action.payload.customer);

        case CustomerActionType.CreateCustomerAddressSucceeded:
        case CustomerActionType.PayPalConnectAuthenticated: // TODO: Think about generic name for updating customer state
            return objectMerge(data, action.payload);

        case CustomerActionType.PayPalConnectCanceled:
            return objectSet(data, 'isPayPalConnectCanceled', action.payload);

        case CustomerActionType.StripeLinkAuthenticated:
            return objectSet(data, 'isStripeLinkAuthenticated', action.payload);

        default:
            return data;
    }
}

function errorsReducer(
    errors: CustomerErrorsState = DEFAULT_STATE.errors,
    action: ReducerActionType,
): CustomerErrorsState {
    switch (action.type) {
        case CustomerActionType.CreateCustomerRequested:
        case CustomerActionType.CreateCustomerSucceeded:
            return objectSet(errors, 'createError', undefined);

        case CustomerActionType.CreateCustomerFailed:
            return objectSet(errors, 'createError', action.payload);

        case CustomerActionType.CreateCustomerAddressRequested:
        case CustomerActionType.CreateCustomerAddressSucceeded:
            return objectSet(errors, 'createAddressError', undefined);

        case CustomerActionType.CreateCustomerAddressFailed:
            return objectSet(errors, 'createAddressError', action.payload);

        default:
            return errors;
    }
}

function statusesReducer(
    statuses: CustomerStatusesState = DEFAULT_STATE.statuses,
    action: ReducerActionType,
): CustomerStatusesState {
    switch (action.type) {
        case CustomerActionType.CreateCustomerRequested:
            return objectSet(statuses, 'isCreating', true);

        case CustomerActionType.CreateCustomerFailed:
        case CustomerActionType.CreateCustomerSucceeded:
            return objectSet(statuses, 'isCreating', false);

        case CustomerActionType.CreateCustomerAddressRequested:
            return objectSet(statuses, 'isCreatingAddress', true);

        case CustomerActionType.CreateCustomerAddressFailed:
        case CustomerActionType.CreateCustomerAddressSucceeded:
            return objectSet(statuses, 'isCreatingAddress', false);

        default:
            return statuses;
    }
}
