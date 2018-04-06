import { combineReducers, Action } from '@bigcommerce/data-store';

import { CheckoutActionType } from '../checkout';
import * as customerActionTypes from '../customer/customer-action-types';
import * as orderActionTypes from '../order/order-action-types';
import * as quoteActionTypes from '../quote/quote-action-types';

import InternalCustomer from './internal-customer';
import mapToInternalCustomer from './map-to-internal-customer';

/**
 * @todo Convert this file into TypeScript properly
 * @param {CustomerState} state
 * @param {Action} action
 * @return {CustomerState}
 */
export default function customerReducer(state: any = {}, action: Action): any {
    const reducer = combineReducers<any>({
        data: dataReducer,
    });

    return reducer(state, action);
}

function dataReducer(data: InternalCustomer, action: Action): InternalCustomer {
    switch (action.type) {
    case CheckoutActionType.LoadCheckoutSucceeded:
        return { ...data, ...mapToInternalCustomer(action.payload, data) };

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
