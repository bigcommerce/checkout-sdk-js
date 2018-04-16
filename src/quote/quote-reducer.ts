import { combineReducers, Action } from '@bigcommerce/data-store';

import * as billingAddressActionTypes from '../billing/billing-address-action-types';
import { CheckoutActionType } from '../checkout';
import * as customerActionTypes from '../customer/customer-action-types';
import { ConsignmentActionTypes } from '../shipping/consignment-actions';
import * as shippingOptionActionTypes from '../shipping/shipping-option-action-types';

import InternalQuote from './internal-quote';
import mapToInternalQuote from './map-to-internal-quote';
import * as quoteActionTypes from './quote-action-types';

/**
 * @todo Convert this file into TypeScript properly
 * i.e.: Action<T>, QuoteState, QuoteMeta
 * @param {QuoteState} state
 * @param {Action} action
 * @return {QuoteState}
 */
export default function quoteReducer(state: any = {}, action: Action): any {
    const reducer = combineReducers<any>({
        data: dataReducer,
        errors: errorsReducer,
        statuses: statusesReducer,
    });

    return reducer(state, action);
}

function dataReducer(data: InternalQuote, action: Action): InternalQuote {
    switch (action.type) {
    case CheckoutActionType.LoadCheckoutSucceeded:
    case ConsignmentActionTypes.CreateConsignmentsSucceeded:
        return { ...data, ...mapToInternalQuote(action.payload) };

    case billingAddressActionTypes.UPDATE_BILLING_ADDRESS_SUCCEEDED:
    case customerActionTypes.SIGN_IN_CUSTOMER_SUCCEEDED:
    case customerActionTypes.SIGN_OUT_CUSTOMER_SUCCEEDED:
    case quoteActionTypes.LOAD_QUOTE_SUCCEEDED:
    case shippingOptionActionTypes.LOAD_SHIPPING_OPTIONS_SUCCEEDED:
    case shippingOptionActionTypes.SELECT_SHIPPING_OPTION_SUCCEEDED:
        return action.payload ? { ...data, ...action.payload.quote } : data;

    default:
        return data;
    }
}

/**
 * @private
 * @param {Object} errors
 * @param {Action} action
 * @return {Object}
 */
function errorsReducer(errors: any = {}, action: Action): any {
    switch (action.type) {
    case CheckoutActionType.LoadCheckoutRequested:
    case CheckoutActionType.LoadCheckoutSucceeded:
    case quoteActionTypes.LOAD_QUOTE_REQUESTED:
    case quoteActionTypes.LOAD_QUOTE_SUCCEEDED:
        return { ...errors, loadError: undefined };

    case CheckoutActionType.LoadCheckoutFailed:
    case quoteActionTypes.LOAD_QUOTE_FAILED:
        return { ...errors, loadError: action.payload };

    case billingAddressActionTypes.UPDATE_BILLING_ADDRESS_REQUESTED:
    case billingAddressActionTypes.UPDATE_BILLING_ADDRESS_SUCCEEDED:
        return { ...errors, updateBillingAddressError: undefined };

    case billingAddressActionTypes.UPDATE_BILLING_ADDRESS_FAILED:
        return { ...errors, updateBillingAddressError: action.payload };

    default:
        return errors;
    }
}

/**
 * @private
 * @param {Object} statuses
 * @param {Action} action
 * @return {Object}
 */
function statusesReducer(statuses: any = {}, action: Action): any {
    switch (action.type) {
    case CheckoutActionType.LoadCheckoutRequested:
    case quoteActionTypes.LOAD_QUOTE_REQUESTED:
        return { ...statuses, isLoading: true };

    case CheckoutActionType.LoadCheckoutSucceeded:
    case CheckoutActionType.LoadCheckoutFailed:
    case quoteActionTypes.LOAD_QUOTE_SUCCEEDED:
    case quoteActionTypes.LOAD_QUOTE_FAILED:
        return { ...statuses, isLoading: false };

    case billingAddressActionTypes.UPDATE_BILLING_ADDRESS_REQUESTED:
        return { ...statuses, isUpdatingBillingAddress: true };

    case billingAddressActionTypes.UPDATE_BILLING_ADDRESS_SUCCEEDED:
    case billingAddressActionTypes.UPDATE_BILLING_ADDRESS_FAILED:
        return { ...statuses, isUpdatingBillingAddress: false };

    default:
        return statuses;
    }
}
