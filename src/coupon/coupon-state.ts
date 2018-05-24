import Coupon from './coupon';

export default interface CouponState {
    data?: Coupon[];
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
