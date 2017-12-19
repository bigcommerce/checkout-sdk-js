"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GiftCertificateSelector = /** @class */ (function () {
    /**
     * @constructor
     * @param {GiftCertificateState} giftCertificate
     */
    function GiftCertificateSelector(giftCertificate) {
        if (giftCertificate === void 0) { giftCertificate = {}; }
        this._giftCertificate = giftCertificate;
    }
    /**
     * @return {?ErrorResponse}
     */
    GiftCertificateSelector.prototype.getRemoveError = function () {
        return this._giftCertificate.errors &&
            this._giftCertificate.errors.removeGiftCertificateError;
    };
    /**
     * @return {?ErrorResponse}
     */
    GiftCertificateSelector.prototype.getApplyError = function () {
        return this._giftCertificate.errors &&
            this._giftCertificate.errors.applyGiftCertificateError;
    };
    /**
     * @return {boolean}
     */
    GiftCertificateSelector.prototype.isApplying = function () {
        return !!(this._giftCertificate.statuses &&
            this._giftCertificate.statuses.isApplyingGiftCertificate);
    };
    /**
     * @return {boolean}
     */
    GiftCertificateSelector.prototype.isRemoving = function () {
        return !!(this._giftCertificate.statuses &&
            this._giftCertificate.statuses.isRemovingGiftCertificate);
    };
    return GiftCertificateSelector;
}());
exports.default = GiftCertificateSelector;
//# sourceMappingURL=gift-certificate-selector.js.map