import { RequestError } from '../common/error/errors';
import { selector } from '../common/selector';

import Coupon from './coupon';
import CouponState from './coupon-state';

@selector
export default class CouponSelector {
    constructor(
        private _coupon: CouponState
    ) {}

    getCoupons(): Coupon[] | undefined {
        return this._coupon.data;
    }

    getRemoveError(): RequestError | undefined {
        return this._coupon.errors.removeCouponError;
    }

    getApplyError(): RequestError | undefined {
        return this._coupon.errors.applyCouponError;
    }

    isApplying(): boolean {
        return !!this._coupon.statuses.isApplyingCoupon;
    }

    isRemoving(): boolean {
        return !!this._coupon.statuses.isRemovingCoupon;
    }
}
