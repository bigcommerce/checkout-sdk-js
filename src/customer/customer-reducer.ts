import { combineReducers, Action } from '@bigcommerce/data-store';

import { CheckoutActionType } from '../checkout';
import * as customerActionTypes from '../customer/customer-action-types';
import * as orderActionTypes from '../order/order-action-types';
import * as quoteActionTypes from '../quote/quote-action-types';

import CustomerState from './customer-state';
import InternalCustomer from './internal-customer';
import mapToInternalCustomer from './map-to-internal-customer';

const DEFAULT_STATE: CustomerState = {};

/**
 * @todo Convert this file into TypeScript properly
 * i.e.: Action
 */
export default function customerReducer(state: CustomerState = DEFAULT_STATE, action: Action): CustomerState {
    const reducer = combineReducers<any>({
        data: dataReducer,
    });

    return reducer(state, action);
}

function dataReducer(data: InternalCustomer | undefined, action: Action): InternalCustomer | undefined {
    switch (action.type) {
    case CheckoutActionType.LoadCheckoutSucceeded:
        return data ? { ...data, ...mapToInternalCustomer(action.payload) } : data;

    case customerActionTypes.SIGN_IN_CUSTOMER_SUCCEEDED:
    case customerActionTypes.SIGN_OUT_CUSTOMER_SUCCEEDED:
    case orderActionTypes.LOAD_ORDER_SUCCEEDED:
    case orderActionTypes.FINALIZE_ORDER_SUCCEEDED:
    case orderActionTypes.SUBMIT_ORDER_SUCCEEDED:
    case quoteActionTypes.LOAD_QUOTE_SUCCEEDED:
        return action.payload ? { ...data, ...action.payload.customer } : data;

    default:
        return data;
    }
}
