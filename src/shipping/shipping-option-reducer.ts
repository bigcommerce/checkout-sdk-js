import { combineReducers, Action } from '@bigcommerce/data-store';

import { CheckoutActionType } from '../checkout';
import * as customerActionTypes from '../customer/customer-action-types';
import * as quoteActionTypes from '../quote/quote-action-types';
import { ConsignmentActionTypes } from '../shipping/consignment-actions';

import mapToInternalShippingOptions from './map-to-internal-shipping-options';

/**
 * @todo Convert this file into TypeScript properly
 * @param {ShippingOptionsState} state
 * @param {Action} action
 * @return {ShippingOptionsState}
 */
export default function shippingOptionReducer(state: any = {}, action: Action): any {
    const reducer = combineReducers({
        data: dataReducer,
        errors: errorsReducer,
        statuses: statusesReducer,
    });

    return reducer(state, action);
}

/**
 * @private
 * @param {?ShippingOptionList} data
 * @param {Action} action
 * @return {?ShippingOptionList}
 */
function dataReducer(data: any, action: Action): any {
    switch (action.type) {
    case CheckoutActionType.LoadCheckoutSucceeded:
    case ConsignmentActionTypes.CreateConsignmentsSucceeded:
    case ConsignmentActionTypes.UpdateConsignmentSucceeded:
        return { ...data, ...mapToInternalShippingOptions(action.payload.consignments, data) };

    case customerActionTypes.SIGN_OUT_CUSTOMER_SUCCEEDED:
    case quoteActionTypes.LOAD_QUOTE_SUCCEEDED:
        return action.payload ? action.payload.shippingOptions : data;

    default:
        return data;
    }
}

function statusesReducer(statuses: any = {}, action: Action): any {
    switch (action.type) {
    case CheckoutActionType.LoadCheckoutRequested:
        return { ...statuses, isLoading: true };

    case CheckoutActionType.LoadCheckoutFailed:
    case CheckoutActionType.LoadCheckoutSucceeded:
        return { ...statuses, isLoading: false };

    default:
        return statuses;
    }
}

function errorsReducer(errors: any = {}, action: Action): any {
    switch (action.type) {
    case CheckoutActionType.LoadCheckoutRequested:
    case CheckoutActionType.LoadCheckoutSucceeded:
        return { ...errors, loadError: undefined };

    case CheckoutActionType.LoadCheckoutFailed:
        return { ...errors, loadError: action.payload };

    default:
        return errors;
    }
}
