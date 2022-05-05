import GiftCertificate from './gift-certificate';
import GiftCertificateState from './gift-certificate-state';

export function getGiftCertificate(): GiftCertificate {
    return {
        balance: 10,
        used: 7,
        remaining: 3,
        code: 'gc',
        purchaseDate: 'ddmmyy',
    };
}

export function getGiftCertificatesState(): GiftCertificateState {
    return {
        data: [
            getGiftCertificate(),
            { ...getGiftCertificate(), code: 'gc2' },
        ],
        errors: {},
        statuses: {},
    };
}
