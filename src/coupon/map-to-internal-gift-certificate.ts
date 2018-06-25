import GiftCertificate from './gift-certificate';
import InternalGiftCertificate from './internal-gift-certificate';

export default function mapToInternalGiftCertificate(giftCertificate: GiftCertificate): InternalGiftCertificate {
    return {
        code: giftCertificate.code,
        discountedAmount: giftCertificate.used,
        remainingBalance: giftCertificate.remaining,
        giftCertificate: {
            balance: giftCertificate.balance,
            code: giftCertificate.code,
            purchaseDate: giftCertificate.purchaseDate,
        },
    };
}
