import InternalCoupon from './internal-coupon';

export default interface CouponState {
    data?: InternalCoupon[];
    errors: CouponErrorsState;
    statuses: CouponStatusesState;
}

export interface CouponErrorsState {
    applyCouponError?: Error;
    removeCouponError?: Error;
}

export interface CouponStatusesState {
    isApplyingCoupon?: boolean;
    isRemovingCoupon?: boolean;
}
