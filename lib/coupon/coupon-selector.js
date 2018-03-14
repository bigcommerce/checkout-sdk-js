"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CouponSelector = (function () {
    function CouponSelector(coupon) {
        if (coupon === void 0) { coupon = {}; }
        this._coupon = coupon;
    }
    CouponSelector.prototype.getRemoveError = function () {
        return this._coupon.errors &&
            this._coupon.errors.removeCouponError;
    };
    CouponSelector.prototype.getApplyError = function () {
        return this._coupon.errors &&
            this._coupon.errors.applyCouponError;
    };
    CouponSelector.prototype.isApplying = function () {
        return !!(this._coupon.statuses &&
            this._coupon.statuses.isApplyingCoupon);
    };
    CouponSelector.prototype.isRemoving = function () {
        return !!(this._coupon.statuses &&
            this._coupon.statuses.isRemovingCoupon);
    };
    return CouponSelector;
}());
exports.default = CouponSelector;
//# sourceMappingURL=coupon-selector.js.map