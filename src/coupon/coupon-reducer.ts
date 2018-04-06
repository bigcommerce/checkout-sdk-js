import { combineReducers, Action } from '@bigcommerce/data-store';

import { CheckoutActionType } from '../checkout';

import * as couponActionTypes from './coupon-action-types';
import InternalCoupon from './internal-coupon';

/**
 * @todo Convert this file into TypeScript properly
 * @param {CouponState} state
 * @param {Action} action
 * @return {CouponState}
 */
export default function couponReducer(state: any = {}, action: Action): any {
    const reducer = combineReducers<any>({
        data: dataReducer,
        errors: errorsReducer,
        statuses: statusesReducer,
    });

    return reducer(state, action);
}

function dataReducer(data: InternalCoupon[], action: Action): InternalCoupon[] {
    switch (action.type) {
    case CheckoutActionType.LoadCheckoutSucceeded:
        return action.payload.coupons;

    default:
        return data;
    }
}

function errorsReducer(errors: any = {}, action: Action): any {
    switch (action.type) {
    case couponActionTypes.APPLY_COUPON_REQUESTED:
    case couponActionTypes.APPLY_COUPON_SUCCEEDED:
        return { ...errors, applyCouponError: undefined };

    case couponActionTypes.APPLY_COUPON_FAILED:
        return { ...errors, applyCouponError: action.payload };

    case couponActionTypes.REMOVE_COUPON_REQUESTED:
    case couponActionTypes.REMOVE_COUPON_SUCCEEDED:
        return { ...errors, removeCouponError: undefined };

    case couponActionTypes.REMOVE_COUPON_FAILED:
        return { ...errors, removeCouponError: action.payload };

    default:
        return errors;
    }
}

function statusesReducer(statuses: any = {}, action: Action): any {
    switch (action.type) {
    case couponActionTypes.APPLY_COUPON_REQUESTED:
        return { ...statuses, isApplyingCoupon: true };

    case couponActionTypes.APPLY_COUPON_SUCCEEDED:
    case couponActionTypes.APPLY_COUPON_FAILED:
        return { ...statuses, isApplyingCoupon: false };

    case couponActionTypes.REMOVE_COUPON_REQUESTED:
        return { ...statuses, isRemovingCoupon: true };

    case couponActionTypes.REMOVE_COUPON_SUCCEEDED:
    case couponActionTypes.REMOVE_COUPON_FAILED:
        return { ...statuses, isRemovingCoupon: false };

    default:
        return statuses;
    }
}
