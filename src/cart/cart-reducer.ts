import { combineReducers, Action } from '@bigcommerce/data-store';

import * as billingAddressActionTypes from '../billing/billing-address-action-types';
import * as cartActionTypes from '../cart/cart-action-types';
import { CheckoutActionType } from '../checkout';
import * as couponActionTypes from '../coupon/coupon-action-types';
import * as giftCertificateActionTypes from '../coupon/gift-certificate-action-types';
import * as customerActionTypes from '../customer/customer-action-types';
import * as quoteActionTypes from '../quote/quote-action-types';
import * as shippingAddressActionTypes from '../shipping/shipping-address-action-types';
import * as shippingOptionActionTypes from '../shipping/shipping-option-action-types';

import Cart from './cart';
import CartState, { CartErrorsState, CartMetaState, CartStatusesState } from './cart-state';
import InternalCart from './internal-cart';
import mapToInternalCart from './map-to-internal-cart';

const DEFAULT_STATE: CartState = {
    errors: {},
    meta: {},
    statuses: {},
};

/**
 * @todo Convert this file into TypeScript properly
 * i.e.: Action
 */
export default function cartReducer(state: CartState = DEFAULT_STATE, action: Action): CartState {
    const reducer = combineReducers<CartState>({
        data: dataReducer,
        externalData: externalDataReducer,
        errors: errorsReducer,
        meta: metaReducer,
        statuses: statusesReducer,
    });

    return reducer(state, action);
}

function dataReducer(data: InternalCart | undefined, action: Action): InternalCart | undefined {
    switch (action.type) {
    case CheckoutActionType.LoadCheckoutSucceeded:
        return data ? { ...data, ...mapToInternalCart(action.payload, data) } : data;

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

function externalDataReducer(data: Cart | undefined, action: Action): Cart | undefined {
    switch (action.type) {
    case CheckoutActionType.LoadCheckoutSucceeded:
        return { ...data, ...action.payload.cart };

    default:
        return data;
    }
}

function metaReducer(meta: CartMetaState = DEFAULT_STATE.meta, action: Action): CartMetaState {
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

function errorsReducer(errors: CartErrorsState = DEFAULT_STATE.errors, action: Action): CartErrorsState {
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

function statusesReducer(statuses: CartStatusesState = DEFAULT_STATE.statuses, action: Action): CartStatusesState {
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
