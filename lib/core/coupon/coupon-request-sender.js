"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CouponRequestSender = /** @class */ (function () {
    /**
     * @constructor
     * @param {RequestSender} requestSender
     */
    function CouponRequestSender(requestSender) {
        this._requestSender = requestSender;
    }
    /**
     * @param {string} couponCode
     * @param {RequestOptions} [options]
     * @return {Promise<Response<Cart>>}
     */
    CouponRequestSender.prototype.applyCoupon = function (couponCode, _a) {
        var timeout = (_a === void 0 ? {} : _a).timeout;
        var url = '/internalapi/v1/checkout/coupon';
        return this._requestSender.post(url, { timeout: timeout, body: { couponCode: couponCode } });
    };
    /**
     * @param {string} couponCode
     * @param {RequestOptions} [options]
     * @return {Promise<Response<Cart>>}
     */
    CouponRequestSender.prototype.removeCoupon = function (couponCode, _a) {
        var timeout = (_a === void 0 ? {} : _a).timeout;
        var url = "/internalapi/v1/checkout/coupon/" + couponCode;
        return this._requestSender.delete(url, { timeout: timeout });
    };
    return CouponRequestSender;
}());
exports.default = CouponRequestSender;
//# sourceMappingURL=coupon-request-sender.js.map