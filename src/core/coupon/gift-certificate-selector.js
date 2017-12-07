export default class GiftCertificateSelector {
    /**
     * @constructor
     * @param {GiftCertificateState} giftCertificate
     */
    constructor(giftCertificate = {}) {
        this._giftCertificate = giftCertificate;
    }

    /**
     * @return {?ErrorResponse}
     */
    getRemoveError() {
        return this._giftCertificate.errors &&
            this._giftCertificate.errors.removeGiftCertificateError;
    }

    /**
     * @return {?ErrorResponse}
     */
    getApplyError() {
        return this._giftCertificate.errors &&
            this._giftCertificate.errors.applyGiftCertificateError;
    }

    /**
     * @return {boolean}
     */
    isApplying() {
        return !!(this._giftCertificate.statuses &&
            this._giftCertificate.statuses.isApplyingGiftCertificate);
    }

    /**
     * @return {boolean}
     */
    isRemoving() {
        return !!(this._giftCertificate.statuses &&
            this._giftCertificate.statuses.isRemovingGiftCertificate);
    }
}
