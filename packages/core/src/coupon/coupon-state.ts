import { StorefrontErrorResponseBody } from '../common/error';
import { RequestError } from '../common/error/errors';

import Coupon from './coupon';

export default interface CouponState {
    data?: Coupon[];
    errors: CouponErrorsState;
    statuses: CouponStatusesState;
}

export interface CouponErrorsState {
    applyCouponError?: RequestError<StorefrontErrorResponseBody>;
    removeCouponError?: RequestError<StorefrontErrorResponseBody>;
}

export interface CouponStatusesState {
    isApplyingCoupon?: boolean;
    isRemovingCoupon?: boolean;
}

export const DEFAULT_STATE: CouponState = {
    errors: {},
    statuses: {},
};
