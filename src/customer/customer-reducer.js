import { combineReducers } from '@bigcommerce/data-store';
import { CheckoutActionType } from '../checkout';
import * as customerActionTypes from '../customer/customer-action-types';
import * as orderActionTypes from '../order/order-action-types';
import * as quoteActionTypes from '../quote/quote-action-types';
import mapToInternalCustomer from './map-to-internal-customer';

/**
 * @param {CustomerState} state
 * @param {Action} action
 * @return {CustomerState}
 */
export default function customerReducer(state = {}, action) {
    const reducer = combineReducers({
        data: dataReducer,
    });

    return reducer(state, action);
}

/**
 * @private
 * @param {?Customer} data
 * @param {Action} action
 * @return {?Customer}
 */
function dataReducer(data, action) {
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
