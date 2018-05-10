import { selector } from '../common/selector';

import CouponState from './coupon-state';

@selector
export default class CouponSelector {
    constructor(
        private _coupon: CouponState
    ) {}

    getRemoveError(): Error | undefined {
        return this._coupon.errors.removeCouponError;
    }

    getApplyError(): Error | undefined {
        return this._coupon.errors.applyCouponError;
    }

    isApplying(): boolean {
        return !!this._coupon.statuses.isApplyingCoupon;
    }

    isRemoving(): boolean {
        return !!this._coupon.statuses.isRemovingCoupon;
    }
}
