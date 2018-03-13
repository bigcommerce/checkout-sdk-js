import { combineReducers } from '@bigcommerce/data-store';
import { CheckoutActionType } from '../checkout';
import * as customerActionTypes from '../customer/customer-action-types';
import * as quoteActionTypes from '../quote/quote-action-types';
import * as shippingAddressActionTypes from '../shipping/shipping-address-action-types';
import * as shippingOptionActionTypes from '../shipping/shipping-option-action-types';
import mapToInternalShippingOptions from './map-to-internal-shipping-options';

/**
 * @param {ShippingOptionsState} state
 * @param {Action} action
 * @return {ShippingOptionsState}
 */
export default function shippingOptionReducer(state = {}, action) {
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
function dataReducer(data, action) {
    switch (action.type) {
    case CheckoutActionType.LoadCheckoutSucceeded:
        return { ...data, ...mapToInternalShippingOptions(action.payload.consignments, data) };

    case customerActionTypes.SIGN_IN_CUSTOMER_SUCCEEDED:
    case customerActionTypes.SIGN_OUT_CUSTOMER_SUCCEEDED:
    case quoteActionTypes.LOAD_QUOTE_SUCCEEDED:
    case shippingAddressActionTypes.UPDATE_SHIPPING_ADDRESS_SUCCEEDED:
    case shippingOptionActionTypes.LOAD_SHIPPING_OPTIONS_SUCCEEDED:
    case shippingOptionActionTypes.SELECT_SHIPPING_OPTION_SUCCEEDED:
        return action.payload ? action.payload.shippingOptions : data;

    default:
        return data;
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
    case shippingOptionActionTypes.LOAD_SHIPPING_OPTIONS_REQUESTED:
        return { ...statuses, isLoading: true };

    case shippingOptionActionTypes.LOAD_SHIPPING_OPTIONS_FAILED:
    case shippingOptionActionTypes.LOAD_SHIPPING_OPTIONS_SUCCEEDED:
        return { ...statuses, isLoading: false };

    case shippingOptionActionTypes.SELECT_SHIPPING_OPTION_REQUESTED:
        return { ...statuses, isSelecting: true };

    case shippingOptionActionTypes.SELECT_SHIPPING_OPTION_FAILED:
    case shippingOptionActionTypes.SELECT_SHIPPING_OPTION_SUCCEEDED:
        return { ...statuses, isSelecting: false };

    default:
        return statuses;
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
    case shippingOptionActionTypes.LOAD_SHIPPING_OPTIONS_REQUESTED:
    case shippingOptionActionTypes.LOAD_SHIPPING_OPTIONS_SUCCEEDED:
        return { ...errors, loadError: undefined };

    case shippingOptionActionTypes.LOAD_SHIPPING_OPTIONS_FAILED:
        return { ...errors, loadError: action.payload };

    case shippingOptionActionTypes.SELECT_SHIPPING_OPTION_REQUESTED:
    case shippingOptionActionTypes.SELECT_SHIPPING_OPTION_SUCCEEDED:
        return { ...errors, selectError: undefined };

    case shippingOptionActionTypes.SELECT_SHIPPING_OPTION_FAILED:
        return { ...errors, selectError: action.payload };

    default:
        return errors;
    }
}
