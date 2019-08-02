import { RequestError } from '../common/error/errors';
import { createSelector } from '../common/selector';
import { memoizeOne } from '../common/utility';

import Coupon from './coupon';
import CouponState, { DEFAULT_STATE } from './coupon-state';

export default interface CouponSelector {
    getCoupons(): Coupon[] | undefined;
    getRemoveError(): RequestError | undefined;
    getApplyError(): RequestError | undefined;
    isApplying(): boolean;
    isRemoving(): boolean;
}

export type CouponSelectorFactory = (state: CouponState) => CouponSelector;

export function createCouponSelectorFactory(): CouponSelectorFactory {
    const getCoupons = createSelector(
        (state: CouponState) => state.data,
        data => () => data
    );

    const getRemoveError = createSelector(
        (state: CouponState) => state.errors.removeCouponError,
        error => () => error
    );

    const getApplyError = createSelector(
        (state: CouponState) => state.errors.applyCouponError,
        error => () => error
    );

    const isApplying = createSelector(
        (state: CouponState) => !!state.statuses.isApplyingCoupon,
        status => () => status
    );

    const isRemoving = createSelector(
        (state: CouponState) => !!state.statuses.isRemovingCoupon,
        status => () => status
    );

    return memoizeOne((
        state: CouponState = DEFAULT_STATE
    ): CouponSelector => {
        return {
            getCoupons: getCoupons(state),
            getRemoveError: getRemoveError(state),
            getApplyError: getApplyError(state),
            isApplying: isApplying(state),
            isRemoving: isRemoving(state),
        };
    });
}
