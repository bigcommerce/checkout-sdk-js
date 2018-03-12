import GiftCertificate from './gift-certificate';
import InternalGiftCertificate from './internal-gift-certificate';

export default function mapToInternalGiftCertificate(giftCertificate: GiftCertificate, existingGiftCertificate: InternalGiftCertificate): InternalGiftCertificate {
    return {
        code: giftCertificate.code,
        discountedAmount: existingGiftCertificate.discountedAmount,
        remainingBalance: existingGiftCertificate.remainingBalance,
        giftCertificate: {
            balance: giftCertificate.balance,
            code: giftCertificate.code,
            purchaseDate: giftCertificate.purchaseDate,
        },
    };
}
