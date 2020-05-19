import { combineReducers } from '@bigcommerce/data-store';

import { BillingAddressActionType, ContinueAsGuestAction } from '../billing';
import { CheckoutAction, CheckoutActionType } from '../checkout';
import { objectMerge } from '../common/utility';

import Customer from './customer';
import CustomerState, { DEFAULT_STATE } from './customer-state';

export default function customerReducer(
    state: CustomerState = DEFAULT_STATE,
    action: CheckoutAction | ContinueAsGuestAction
): CustomerState {
    const reducer = combineReducers<CustomerState, CheckoutAction | ContinueAsGuestAction>({
        data: dataReducer,
    });

    return reducer(state, action);
}

function dataReducer(
    data: Customer | undefined,
    action: CheckoutAction | ContinueAsGuestAction
): Customer | undefined {
    switch (action.type) {
    case BillingAddressActionType.ContinueAsGuestSucceeded:
    case CheckoutActionType.LoadCheckoutSucceeded:
        return objectMerge(data, action.payload && action.payload.customer);

    default:
        return data;
    }
}
