import { combineReducers } from '@bigcommerce/data-store';
import { CheckoutActionType } from '../checkout';
import * as billingAddressActionTypes from '../billing/billing-address-action-types';
import * as customerActionTypes from '../customer/customer-action-types';
import * as quoteActionTypes from './quote-action-types';
import * as shippingAddressActionTypes from '../shipping/shipping-address-action-types';
import * as shippingOptionActionTypes from '../shipping/shipping-option-action-types';
import mapToInternalQuote from './map-to-internal-quote';

/**
 * @param {QuoteState} state
 * @param {Action} action
 * @return {QuoteState}
 */
export default function quoteReducer(state = {}, action) {
    const reducer = combineReducers({
        data: dataReducer,
        errors: errorsReducer,
        meta: metaReducer,
        statuses: statusesReducer,
    });

    return reducer(state, action);
}

/**
 * @private
 * @param {?Quote} data
 * @param {Action} action
 * @return {?Quote}
 */
function dataReducer(data, action) {
    switch (action.type) {
    case CheckoutActionType.LoadCheckoutSucceeded:
        return { ...data, ...mapToInternalQuote(action.payload, data) };

    case billingAddressActionTypes.UPDATE_BILLING_ADDRESS_SUCCEEDED:
    case customerActionTypes.SIGN_IN_CUSTOMER_SUCCEEDED:
    case customerActionTypes.SIGN_OUT_CUSTOMER_SUCCEEDED:
    case quoteActionTypes.LOAD_QUOTE_SUCCEEDED:
    case shippingAddressActionTypes.UPDATE_SHIPPING_ADDRESS_SUCCEEDED:
    case shippingOptionActionTypes.LOAD_SHIPPING_OPTIONS_SUCCEEDED:
    case shippingOptionActionTypes.SELECT_SHIPPING_OPTION_SUCCEEDED:
        return action.payload ? { ...data, ...action.payload.quote } : data;

    default:
        return data;
    }
}

/**
 * @private
 * @param {?Object} meta
 * @param {Action} action
 * @return {?Object}
 */
function metaReducer(meta, action) {
    switch (action.type) {
    case quoteActionTypes.LOAD_QUOTE_SUCCEEDED:
        return action.meta ? { ...meta, ...action.meta } : meta;

    default:
        return meta;
    }
}

/**
 * @private
 * @param {Object} errors
 * @param {Action} action
 * @return {Object}
 */
function errorsReducer(errors = {}, action) {
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
function statusesReducer(statuses = {}, action) {
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
