import * as billingAddressActionTypes from '../billing/billing-address-action-types';
import * as customerActionTypes from '../customer/customer-action-types';
import * as quoteActionTypes from './quote-action-types';
import * as shippingAddressActionTypes from '../shipping/shipping-address-action-types';
import * as shippingOptionActionTypes from '../shipping/shipping-option-action-types';
import { combineReducers } from '../../data-store';

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
 * @param {Quote} data
 * @param {Action} action
 * @return {Quote}
 */
function dataReducer(data = {}, action) {
    switch (action.type) {
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
 * @param {Object} meta
 * @param {Action} action
 * @return {Object}
 */
function metaReducer(meta = {}, action) {
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
    case quoteActionTypes.LOAD_QUOTE_REQUESTED:
    case quoteActionTypes.LOAD_QUOTE_SUCCEEDED:
        return { ...errors, loadError: undefined };

    case quoteActionTypes.LOAD_QUOTE_FAILED:
        return { ...errors, loadError: action.payload };

    case billingAddressActionTypes.UPDATE_BILLING_ADDRESS_REQUESTED:
    case billingAddressActionTypes.UPDATE_BILLING_ADDRESS_SUCCEEDED:
        return { ...errors, updateBillingAddressError: undefined };

    case billingAddressActionTypes.UPDATE_BILLING_ADDRESS_FAILED:
        return { ...errors, updateBillingAddressError: action.payload };

    case shippingAddressActionTypes.UPDATE_SHIPPING_ADDRESS_REQUESTED:
    case shippingAddressActionTypes.UPDATE_SHIPPING_ADDRESS_SUCCEEDED:
        return { ...errors, updateShippingAddressError: undefined };

    case shippingAddressActionTypes.UPDATE_SHIPPING_ADDRESS_FAILED:
        return { ...errors, updateShippingAddressError: action.payload };

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
    case quoteActionTypes.LOAD_QUOTE_REQUESTED:
        return { ...statuses, isLoading: true };

    case quoteActionTypes.LOAD_QUOTE_SUCCEEDED:
    case quoteActionTypes.LOAD_QUOTE_FAILED:
        return { ...statuses, isLoading: false };

    case billingAddressActionTypes.UPDATE_BILLING_ADDRESS_REQUESTED:
        return { ...statuses, isUpdatingBillingAddress: true };

    case billingAddressActionTypes.UPDATE_BILLING_ADDRESS_SUCCEEDED:
    case billingAddressActionTypes.UPDATE_BILLING_ADDRESS_FAILED:
        return { ...statuses, isUpdatingBillingAddress: false };

    case shippingAddressActionTypes.UPDATE_SHIPPING_ADDRESS_REQUESTED:
        return { ...statuses, isUpdatingShippingAddress: true };

    case shippingAddressActionTypes.UPDATE_SHIPPING_ADDRESS_SUCCEEDED:
    case shippingAddressActionTypes.UPDATE_SHIPPING_ADDRESS_FAILED:
        return { ...statuses, isUpdatingShippingAddress: false };

    default:
        return statuses;
    }
}
