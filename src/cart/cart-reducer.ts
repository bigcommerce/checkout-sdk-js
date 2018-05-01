import { combineReducers, Action } from '@bigcommerce/data-store';

import { BillingAddressActionTypes } from '../billing/billing-address-actions';
import * as cartActionTypes from '../cart/cart-action-types';
import { CheckoutActionType } from '../checkout';
import * as couponActionTypes from '../coupon/coupon-action-types';
import * as giftCertificateActionTypes from '../coupon/gift-certificate-action-types';
import * as customerActionTypes from '../customer/customer-action-types';
import * as quoteActionTypes from '../quote/quote-action-types';
import { ConsignmentActionTypes } from '../shipping/consignment-actions';

import Cart from './cart';
import InternalCart from './internal-cart';
import mapToInternalCart from './map-to-internal-cart';

/**
 * @todo Convert this file into TypeScript properly
 * @param {CartState} state
 * @param {Action} action
 * @return {CartState}
 */
export default function cartReducer(state: any = {}, action: Action): any {
    const reducer = combineReducers<any>({
        data: dataReducer,
        externalData: externalDataReducer,
        errors: errorsReducer,
        meta: metaReducer,
        statuses: statusesReducer,
    });

    return reducer(state, action);
}

function dataReducer(data: InternalCart, action: Action): InternalCart {
    switch (action.type) {
    case BillingAddressActionTypes.UpdateBillingAddressSucceeded:
    case CheckoutActionType.LoadCheckoutSucceeded:
    case ConsignmentActionTypes.CreateConsignmentsSucceeded:
    case ConsignmentActionTypes.UpdateConsignmentSucceeded:
    case couponActionTypes.APPLY_COUPON_SUCCEEDED:
    case couponActionTypes.REMOVE_COUPON_SUCCEEDED:
    case giftCertificateActionTypes.APPLY_GIFT_CERTIFICATE_SUCCEEDED:
    case giftCertificateActionTypes.REMOVE_GIFT_CERTIFICATE_SUCCEEDED:
        return { ...data, ...mapToInternalCart(action.payload, data) };

    case cartActionTypes.LOAD_CART_SUCCEEDED:
    case customerActionTypes.SIGN_IN_CUSTOMER_SUCCEEDED:
    case customerActionTypes.SIGN_OUT_CUSTOMER_SUCCEEDED:
    case quoteActionTypes.LOAD_QUOTE_SUCCEEDED:
        return action.payload ? { ...data, ...action.payload.cart } : data;

    default:
        return data;
    }
}

function externalDataReducer(data: Cart, action: Action): Cart {
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
function metaReducer(meta: any, action: Action): any {
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

function errorsReducer(errors: any = {}, action: Action): any {
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

function statusesReducer(statuses: any = {}, action: Action): any {
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
