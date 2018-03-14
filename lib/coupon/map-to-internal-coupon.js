"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function mapToInternalCoupon(coupon, existingCoupon) {
    return {
        code: coupon.code,
        discount: existingCoupon.discount,
        discountType: existingCoupon.discountType,
        name: existingCoupon.name,
    };
}
exports.default = mapToInternalCoupon;
//# sourceMappingURL=map-to-internal-coupon.js.map