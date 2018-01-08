"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GiftCertificateSelector = (function () {
    function GiftCertificateSelector(giftCertificate) {
        if (giftCertificate === void 0) { giftCertificate = {}; }
        this._giftCertificate = giftCertificate;
    }
    GiftCertificateSelector.prototype.getRemoveError = function () {
        return this._giftCertificate.errors &&
            this._giftCertificate.errors.removeGiftCertificateError;
    };
    GiftCertificateSelector.prototype.getApplyError = function () {
        return this._giftCertificate.errors &&
            this._giftCertificate.errors.applyGiftCertificateError;
    };
    GiftCertificateSelector.prototype.isApplying = function () {
        return !!(this._giftCertificate.statuses &&
            this._giftCertificate.statuses.isApplyingGiftCertificate);
    };
    GiftCertificateSelector.prototype.isRemoving = function () {
        return !!(this._giftCertificate.statuses &&
            this._giftCertificate.statuses.isRemovingGiftCertificate);
    };
    return GiftCertificateSelector;
}());
exports.default = GiftCertificateSelector;
//# sourceMappingURL=gift-certificate-selector.js.map