import { combineReducers } from '@bigcommerce/data-store';

import { BillingAddressAction, BillingAddressActionType } from '../billing/billing-address-actions';
import { CheckoutAction, CheckoutActionType } from '../checkout';

import Customer from './customer';
import CustomerState from './customer-state';

const DEFAULT_STATE: CustomerState = {};

export default function customerReducer(
    state: CustomerState = DEFAULT_STATE,
    action: CheckoutAction | BillingAddressAction
): CustomerState {
    const reducer = combineReducers<CustomerState, CheckoutAction | BillingAddressAction >({
        data: dataReducer,
    });

    return reducer(state, action);
}

function dataReducer(
    data: Customer | undefined,
    action: CheckoutAction | BillingAddressAction
): Customer | undefined {
    switch (action.type) {
    case CheckoutActionType.LoadCheckoutSucceeded:
        return action.payload ? { ...data, ...action.payload.customer } : data;

    case BillingAddressActionType.UpdateBillingAddressSucceeded:
        return action.payload && action.payload.billingAddress ? { ...data, email: action.payload.billingAddress.email } as Customer : data;

    default:
        return data;
    }
}
