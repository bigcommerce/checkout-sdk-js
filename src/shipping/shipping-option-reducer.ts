import { combineReducers, Action } from '@bigcommerce/data-store';

import { CheckoutActionType } from '../checkout';
import * as customerActionTypes from '../customer/customer-action-types';
import * as quoteActionTypes from '../quote/quote-action-types';
import { ConsignmentActionTypes } from '../shipping/consignment-actions';
import * as shippingOptionActionTypes from '../shipping/shipping-option-action-types';

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
        return { ...data, ...mapToInternalShippingOptions(action.payload.consignments, data) };

    case customerActionTypes.SIGN_IN_CUSTOMER_SUCCEEDED:
    case customerActionTypes.SIGN_OUT_CUSTOMER_SUCCEEDED:
    case quoteActionTypes.LOAD_QUOTE_SUCCEEDED:
    case shippingOptionActionTypes.LOAD_SHIPPING_OPTIONS_SUCCEEDED:
    case shippingOptionActionTypes.SELECT_SHIPPING_OPTION_SUCCEEDED:
        return action.payload ? action.payload.shippingOptions : data;

    default:
        return data;
    }
}

function statusesReducer(statuses: any = {}, action: Action): any {
    switch (action.type) {
    case shippingOptionActionTypes.LOAD_SHIPPING_OPTIONS_REQUESTED:
        return { ...statuses, isLoading: true };

    case shippingOptionActionTypes.LOAD_SHIPPING_OPTIONS_FAILED:
    case shippingOptionActionTypes.LOAD_SHIPPING_OPTIONS_SUCCEEDED:
        return { ...statuses, isLoading: false };

    default:
        return statuses;
    }
}

function errorsReducer(errors: any = {}, action: Action): any {
    switch (action.type) {
    case shippingOptionActionTypes.LOAD_SHIPPING_OPTIONS_REQUESTED:
    case shippingOptionActionTypes.LOAD_SHIPPING_OPTIONS_SUCCEEDED:
        return { ...errors, loadError: undefined };

    case shippingOptionActionTypes.LOAD_SHIPPING_OPTIONS_FAILED:
        return { ...errors, loadError: action.payload };

    default:
        return errors;
    }
}
