import GiftCertificate from './gift-certificate';

export function getGiftCertificate(): GiftCertificate {
    return {
        balance: 10,
        used: 7,
        remaining: 3,
        code: 'gc',
        purchaseDate: 'ddmmyy',
    };
}
