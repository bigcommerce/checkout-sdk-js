import InternalGiftCertificate from './internal-gift-certificate';

export default interface GiftCertificateState {
    data?: InternalGiftCertificate[];
    errors: GiftCertificateErrorsState;
    statuses: GiftCertificateStatusesState;
}

export interface GiftCertificateErrorsState {
    applyGiftCertificateError?: Error;
    removeGiftCertificateError?: Error;
}

export interface GiftCertificateStatusesState {
    isApplyingGiftCertificate?: boolean;
    isRemovingGiftCertificate?: boolean;
}
