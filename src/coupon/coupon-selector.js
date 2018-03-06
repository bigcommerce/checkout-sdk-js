export default class CouponSelector {
    /**
     * @constructor
     * @param {CouponState} coupon
     */
    constructor(coupon = {}) {
        this._coupon = coupon;
    }

    /**
     * @return {?ErrorResponse}
     */
    getRemoveError() {
        return this._coupon.errors &&
            this._coupon.errors.removeCouponError;
    }

    /**
     * @return {?ErrorResponse}
     */
    getApplyError() {
        return this._coupon.errors &&
            this._coupon.errors.applyCouponError;
    }

    /**
     * @return {boolean}
     */
    isApplying() {
        return !!(this._coupon.statuses &&
            this._coupon.statuses.isApplyingCoupon);
    }

    /**
     * @return {boolean}
     */
    isRemoving() {
        return !!(this._coupon.statuses &&
            this._coupon.statuses.isRemovingCoupon);
    }
}
