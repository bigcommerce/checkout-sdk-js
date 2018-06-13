import { selector } from '../common/selector';

import GiftCertificate from './gift-certificate';
import GiftCertificateState from './gift-certificate-state';

@selector
export default class GiftCertificateSelector {
    constructor(
        private _giftCertificate: GiftCertificateState
    ) {}

    getGiftCertificates(): GiftCertificate[] | undefined {
        return this._giftCertificate.data;
    }

    getRemoveError(): Error | undefined {
        return this._giftCertificate.errors.removeGiftCertificateError;
    }

    getApplyError(): Error | undefined {
        return this._giftCertificate.errors.applyGiftCertificateError;
    }

    isApplying(): boolean {
        return !!this._giftCertificate.statuses.isApplyingGiftCertificate;
    }

    isRemoving(): boolean {
        return !!this._giftCertificate.statuses.isRemovingGiftCertificate;
    }
}
