import { selector } from '../common/selector';

/**
 * @todo Convert this file into TypeScript properly
 */
@selector
export default class GiftCertificateSelector {
    /**
     * @constructor
     * @param {GiftCertificateState} giftCertificate
     */
    constructor(
        private _giftCertificate: any = {}
    ) {}

    getRemoveError(): Error | undefined {
        return this._giftCertificate.errors &&
            this._giftCertificate.errors.removeGiftCertificateError;
    }

    getApplyError(): Error | undefined {
        return this._giftCertificate.errors &&
            this._giftCertificate.errors.applyGiftCertificateError;
    }

    isApplying(): boolean {
        return !!(this._giftCertificate.statuses &&
            this._giftCertificate.statuses.isApplyingGiftCertificate);
    }

    isRemoving(): boolean {
        return !!(this._giftCertificate.statuses &&
            this._giftCertificate.statuses.isRemovingGiftCertificate);
    }
}
