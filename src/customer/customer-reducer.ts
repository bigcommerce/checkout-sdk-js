import { combineReducers } from '@bigcommerce/data-store';

import { BillingAddressAction, BillingAddressActionTypes } from '../billing/billing-address-actions';
import { CheckoutAction, CheckoutActionType } from '../checkout';
import { OrderAction, OrderActionType } from '../order';

import { CustomerAction, CustomerActionType } from './customer-actions';
import CustomerState from './customer-state';
import InternalCustomer from './internal-customer';
import mapToInternalCustomer from './map-to-internal-customer';

const DEFAULT_STATE: CustomerState = {};

export default function customerReducer(
    state: CustomerState = DEFAULT_STATE,
    action: CheckoutAction | BillingAddressAction | CustomerAction | OrderAction
): CustomerState {
    const reducer = combineReducers<any>({
        data: dataReducer,
    });

    return reducer(state, action);
}

function dataReducer(
    data: InternalCustomer | undefined,
    action: CheckoutAction | BillingAddressAction | CustomerAction | OrderAction
): InternalCustomer | undefined {
    switch (action.type) {
    case CheckoutActionType.LoadCheckoutSucceeded:
    case BillingAddressActionTypes.UpdateBillingAddressSucceeded:
        return action.payload ? { ...data, ...mapToInternalCustomer(action.payload) } : data;

    case CustomerActionType.SignInCustomerSucceeded:
    case CustomerActionType.SignOutCustomerSucceeded:
    case OrderActionType.LoadOrderSucceeded:
    case OrderActionType.FinalizeOrderSucceeded:
    case OrderActionType.SubmitOrderSucceeded:
        return action.payload ? { ...data, ...action.payload.customer } : data;

    default:
        return data;
    }
}
