import { combineReducers } from '@bigcommerce/data-store';

import { Address } from '../address';
import { CheckoutAction, CheckoutActionType } from '../checkout';

import { BillingAddressAction, BillingAddressActionTypes } from './billing-address-actions';
import BillingAddressState from './billing-address-state';

const DEFAULT_STATE: BillingAddressState = {};

export default function billingAddressReducer(
    state: BillingAddressState = DEFAULT_STATE,
    action: CheckoutAction
): BillingAddressState {
    const reducer = combineReducers<BillingAddressState, CheckoutAction | BillingAddressAction>({
        data: dataReducer,
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
