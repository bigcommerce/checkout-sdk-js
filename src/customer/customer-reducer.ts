import { combineReducers, composeReducers } from '@bigcommerce/data-store';

import { BillingAddressActionType, ContinueAsGuestAction } from '../billing';
import { CheckoutAction, CheckoutActionType } from '../checkout';
import { clearErrorReducer } from '../common/error';
import { objectMerge, objectSet } from '../common/utility';

import Customer from './customer';
import { CreateCustomerAction, CustomerActionType } from './customer-actions';
import CustomerState, { CustomerErrorsState, CustomerStatusesState, DEFAULT_STATE } from './customer-state';

export default function customerReducer(
    state: CustomerState = DEFAULT_STATE,
    action: CheckoutAction | ContinueAsGuestAction | CreateCustomerAction
): CustomerState {
    const reducer = combineReducers<CustomerState, CheckoutAction | CreateCustomerAction | ContinueAsGuestAction>({
        data: dataReducer,
        errors: composeReducers(errorsReducer, clearErrorReducer),
        statuses: statusesReducer,
    });

    return reducer(state, action);
}

function dataReducer(
    data: Customer | undefined,
    action: CheckoutAction | ContinueAsGuestAction | CreateCustomerAction
): Customer | undefined {
    switch (action.type) {
    case BillingAddressActionType.ContinueAsGuestSucceeded:
    case CheckoutActionType.LoadCheckoutSucceeded:
        return objectMerge(data, action.payload && action.payload.customer);

    default:
        return data;
    }
}

function errorsReducer(
    errors: CustomerErrorsState = DEFAULT_STATE.errors,
    action: CheckoutAction | ContinueAsGuestAction | CreateCustomerAction
): CustomerErrorsState {
    switch (action.type) {
    case CustomerActionType.CreateCustomerRequested:
    case CustomerActionType.CreateCustomerSucceeded:
        return objectSet(errors, 'createError', undefined);

    case CustomerActionType.CreateCustomerFailed:
        return objectSet(errors, 'createError', action.payload);

    default:
        return errors;
    }
}

function statusesReducer(
    statuses: CustomerStatusesState = DEFAULT_STATE.statuses,
    action: CheckoutAction | ContinueAsGuestAction | CreateCustomerAction
): CustomerStatusesState {
    switch (action.type) {
    case CustomerActionType.CreateCustomerRequested:
        return objectSet(statuses, 'isCreating', true);

    case CustomerActionType.CreateCustomerFailed:
    case CustomerActionType.CreateCustomerSucceeded:
        return objectSet(statuses, 'isCreating', false);
    default:
        return statuses;
    }
}
