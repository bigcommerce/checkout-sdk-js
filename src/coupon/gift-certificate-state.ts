import GiftCertificate from './gift-certificate';

export default interface GiftCertificateState {
    data?: GiftCertificate[];
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
