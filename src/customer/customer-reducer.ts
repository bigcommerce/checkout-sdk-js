import { combineReducers } from '@bigcommerce/data-store';

import { CheckoutAction, CheckoutActionType } from '../checkout';

import Customer from './customer';
import CustomerState, { DEFAULT_STATE } from './customer-state';

export default function customerReducer(
    state: CustomerState = DEFAULT_STATE,
    action: CheckoutAction
): CustomerState {
    const reducer = combineReducers<CustomerState, CheckoutAction>({
        data: dataReducer,
    });

    return reducer(state, action);
}

function dataReducer(
    data: Customer | undefined,
    action: CheckoutAction
): Customer | undefined {
    switch (action.type) {
    case CheckoutActionType.LoadCheckoutSucceeded:
        return action.payload ? { ...data, ...action.payload.customer } : data;

    default:
        return data;
    }
}
