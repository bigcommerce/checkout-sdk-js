import { combineReducers } from '@bigcommerce/data-store';
import { CheckoutActionType } from '../checkout';
import * as billingAddressActionTypes from '../billing/billing-address-action-types';
import * as cartActionTypes from '../cart/cart-action-types';
import * as couponActionTypes from '../coupon/coupon-action-types';
import * as customerActionTypes from '../customer/customer-action-types';
import * as giftCertificateActionTypes from '../coupon/gift-certificate-action-types';
import * as quoteActionTypes from '../quote/quote-action-types';
import * as shippingAddressActionTypes from '../shipping/shipping-address-action-types';
import * as shippingOptionActionTypes from '../shipping/shipping-option-action-types';
import mapToInternalCart from './map-to-internal-cart';

/**
 * @param {CartState} state
 * @param {Action} action
 * @return {CartState}
 */
export default function cartReducer(state = {}, action) {
    const reducer = combineReducers({
        data: dataReducer,
        externalData: externalDataReducer,
        errors: errorsReducer,
        meta: metaReducer,
        statuses: statusesReducer,
    });

    return reducer(state, action);
}

/**
 * @private
 * @param {?InternalCart} data
 * @param {Action} action
 * @return {?InternalCart}
 */
function dataReducer(data, action) {
    switch (action.type) {
    case CheckoutActionType.LoadCheckoutSucceeded:
        return { ...data, ...mapToInternalCart(action.payload, data) };

    case cartActionTypes.CART_UPDATED:
        return action.payload ? { ...data, ...action.payload } : data;

    case billingAddressActionTypes.UPDATE_BILLING_ADDRESS_SUCCEEDED:
    case cartActionTypes.LOAD_CART_SUCCEEDED:
    case customerActionTypes.SIGN_IN_CUSTOMER_SUCCEEDED:
    case customerActionTypes.SIGN_OUT_CUSTOMER_SUCCEEDED:
    case quoteActionTypes.LOAD_QUOTE_SUCCEEDED:
    case shippingAddressActionTypes.UPDATE_SHIPPING_ADDRESS_SUCCEEDED:
    case shippingOptionActionTypes.LOAD_SHIPPING_OPTIONS_SUCCEEDED:
    case shippingOptionActionTypes.SELECT_SHIPPING_OPTION_SUCCEEDED:
    case couponActionTypes.APPLY_COUPON_SUCCEEDED:
    case couponActionTypes.REMOVE_COUPON_SUCCEEDED:
    case giftCertificateActionTypes.APPLY_GIFT_CERTIFICATE_SUCCEEDED:
    case giftCertificateActionTypes.REMOVE_GIFT_CERTIFICATE_SUCCEEDED:
        return action.payload ? { ...data, ...action.payload.cart } : data;

    default:
        return data;
    }
}

/**
 * @private
 * @param {?Cart} data
 * @param {Action} action
 * @return {?Cart}
 */
function externalDataReducer(data, action) {
    switch (action.type) {
    case CheckoutActionType.LoadCheckoutSucceeded:
        return { ...data, ...action.payload.cart };

    default:
        return data;
    }
}

/**
 * @private
 * @param {?CartMeta} meta
 * @param {Action} action
 * @return {?CartMeta}
 */
function metaReducer(meta, action) {
    switch (action.type) {
    case cartActionTypes.VERIFY_CART_SUCCEEDED:
        return { ...meta, isValid: action.payload };

    case CheckoutActionType.LoadCheckoutSucceeded:
    case cartActionTypes.LOAD_CART_SUCCEEDED:
    case quoteActionTypes.LOAD_QUOTE_SUCCEEDED:
        return { ...meta, isValid: true };

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
    case cartActionTypes.LOAD_CART_REQUESTED:
    case cartActionTypes.LOAD_CART_SUCCEEDED:
        return { ...errors, loadError: undefined };

    case cartActionTypes.LOAD_CART_FAILED:
        return { ...errors, loadError: action.payload };

    case cartActionTypes.VERIFY_CART_REQUESTED:
        return { ...errors, verifyError: undefined };

    case cartActionTypes.VERIFY_CART_SUCCEEDED:
    case cartActionTypes.VERIFY_CART_FAILED:
        return { ...errors, verifyError: action.payload };

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
    case cartActionTypes.LOAD_CART_REQUESTED:
        return { ...statuses, isLoading: true };

    case cartActionTypes.LOAD_CART_SUCCEEDED:
    case cartActionTypes.LOAD_CART_FAILED:
        return { ...statuses, isLoading: false };

    case cartActionTypes.VERIFY_CART_REQUESTED:
        return { ...statuses, isVerifying: true };

    case cartActionTypes.VERIFY_CART_SUCCEEDED:
    case cartActionTypes.VERIFY_CART_FAILED:
        return { ...statuses, isVerifying: false };

    default:
        return statuses;
    }
}
