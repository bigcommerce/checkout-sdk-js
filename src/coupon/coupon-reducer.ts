import { combineReducers, Action } from '@bigcommerce/data-store';

import { CheckoutActionType } from '../checkout';

import * as couponActionTypes from './coupon-action-types';
import CouponState, { CouponErrorsState, CouponStatusesState } from './coupon-state';
import InternalCoupon from './internal-coupon';

const DEFAULT_STATE: CouponState = {
    errors: {},
    statuses: {},
};

/**
 * @todo Convert this file into TypeScript properly
 * i.e.: Action
 */
export default function couponReducer(state: CouponState = DEFAULT_STATE, action: Action): CouponState {
    const reducer = combineReducers<CouponState>({
        data: dataReducer,
        errors: errorsReducer,
        statuses: statusesReducer,
    });

    return reducer(state, action);
}

function dataReducer(data: InternalCoupon[] | undefined, action: Action): InternalCoupon[] | undefined {
    switch (action.type) {
    case CheckoutActionType.LoadCheckoutSucceeded:
        return action.payload.coupons;

    default:
        return data;
    }
}

function errorsReducer(errors: CouponErrorsState = {}, action: Action): CouponErrorsState {
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

function statusesReducer(statuses: CouponStatusesState = {}, action: Action): CouponStatusesState {
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
