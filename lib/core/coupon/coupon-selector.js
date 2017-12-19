"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CouponSelector = /** @class */ (function () {
    /**
     * @constructor
     * @param {CouponState} coupon
     */
    function CouponSelector(coupon) {
        if (coupon === void 0) { coupon = {}; }
        this._coupon = coupon;
    }
    /**
     * @return {?ErrorResponse}
     */
    CouponSelector.prototype.getRemoveError = function () {
        return this._coupon.errors &&
            this._coupon.errors.removeCouponError;
    };
    /**
     * @return {?ErrorResponse}
     */
    CouponSelector.prototype.getApplyError = function () {
        return this._coupon.errors &&
            this._coupon.errors.applyCouponError;
    };
    /**
     * @return {boolean}
     */
    CouponSelector.prototype.isApplying = function () {
        return !!(this._coupon.statuses &&
            this._coupon.statuses.isApplyingCoupon);
    };
    /**
     * @return {boolean}
     */
    CouponSelector.prototype.isRemoving = function () {
        return !!(this._coupon.statuses &&
            this._coupon.statuses.isRemovingCoupon);
    };
    return CouponSelector;
}());
exports.default = CouponSelector;
//# sourceMappingURL=coupon-selector.js.map