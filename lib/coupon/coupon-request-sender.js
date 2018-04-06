"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CouponRequestSender = (function () {
    function CouponRequestSender(_requestSender) {
        this._requestSender = _requestSender;
    }
    CouponRequestSender.prototype.applyCoupon = function (couponCode, _a) {
        var timeout = (_a === void 0 ? {} : _a).timeout;
        var url = '/internalapi/v1/checkout/coupon';
        return this._requestSender.post(url, { timeout: timeout, body: { couponCode: couponCode } });
    };
    CouponRequestSender.prototype.removeCoupon = function (couponCode, _a) {
        var timeout = (_a === void 0 ? {} : _a).timeout;
        var url = "/internalapi/v1/checkout/coupon/" + couponCode;
        return this._requestSender.delete(url, { timeout: timeout });
    };
    return CouponRequestSender;
}());
exports.default = CouponRequestSender;
//# sourceMappingURL=coupon-request-sender.js.map