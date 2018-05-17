import { combineReducers, Action } from '@bigcommerce/data-store';

import { BillingAddressActionTypes } from '../billing/billing-address-actions';
import * as cartActionTypes from '../cart/cart-action-types';
import { CheckoutActionType } from '../checkout';
import { CouponActionType } from '../coupon/coupon-actions';
import { GiftCertificateActionType } from '../coupon/gift-certificate-actions';
import * as customerActionTypes from '../customer/customer-action-types';
import { ConsignmentActionTypes } from '../shipping/consignment-actions';

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
    case BillingAddressActionTypes.UpdateBillingAddressSucceeded:
    case CheckoutActionType.LoadCheckoutSucceeded:
    case ConsignmentActionTypes.CreateConsignmentsSucceeded:
    case ConsignmentActionTypes.UpdateConsignmentSucceeded:
    case CouponActionType.ApplyCouponSucceeded:
    case CouponActionType.RemoveCouponSucceeded:
    case GiftCertificateActionType.ApplyGiftCertificateSucceeded:
    case GiftCertificateActionType.RemoveGiftCertificateSucceeded:
        return action.payload ? { ...data, ...mapToInternalCart(action.payload) } : data;

    case customerActionTypes.SIGN_IN_CUSTOMER_SUCCEEDED:
    case customerActionTypes.SIGN_OUT_CUSTOMER_SUCCEEDED:
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
        return { ...meta, isValid: true };

    default:
        return meta;
    }
}

function errorsReducer(errors: CartErrorsState = DEFAULT_STATE.errors, action: Action): CartErrorsState {
    switch (action.type) {
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
    case cartActionTypes.VERIFY_CART_REQUESTED:
        return { ...statuses, isVerifying: true };

    case cartActionTypes.VERIFY_CART_SUCCEEDED:
    case cartActionTypes.VERIFY_CART_FAILED:
        return { ...statuses, isVerifying: false };

    default:
        return statuses;
    }
}
