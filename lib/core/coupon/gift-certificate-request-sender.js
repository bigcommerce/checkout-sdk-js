"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GiftCertificateRequestSender = (function () {
    function GiftCertificateRequestSender(requestSender) {
        this._requestSender = requestSender;
    }
    GiftCertificateRequestSender.prototype.applyGiftCertificate = function (couponCode, _a) {
        var timeout = (_a === void 0 ? {} : _a).timeout;
        var url = '/internalapi/v1/checkout/coupon';
        return this._requestSender.post(url, { timeout: timeout, body: { couponCode: couponCode } });
    };
    GiftCertificateRequestSender.prototype.removeGiftCertificate = function (couponCode, _a) {
        var timeout = (_a === void 0 ? {} : _a).timeout;
        var url = "/internalapi/v1/checkout/coupon/" + couponCode;
        return this._requestSender.delete(url, { timeout: timeout });
    };
    return GiftCertificateRequestSender;
}());
exports.default = GiftCertificateRequestSender;
//# sourceMappingURL=gift-certificate-request-sender.js.map