/**
 * @todo Convert this file into TypeScript properly
 */
export default class CouponSelector {
    /**
     * @constructor
     * @param {CouponState} coupon
     */
    constructor(
        private _coupon: any = {}
    ) {}

    getRemoveError(): Error | undefined {
        return this._coupon.errors &&
            this._coupon.errors.removeCouponError;
    }

    getApplyError(): Error | undefined {
        return this._coupon.errors &&
            this._coupon.errors.applyCouponError;
    }

    isApplying(): boolean {
        return !!(this._coupon.statuses &&
            this._coupon.statuses.isApplyingCoupon);
    }

    isRemoving(): boolean {
        return !!(this._coupon.statuses &&
            this._coupon.statuses.isRemovingCoupon);
    }
}
