import GiftCertificate from './gift-certificate';
import InternalGiftCertificate from './internal-gift-certificate';

/**
 * @deprecated This mapper is only for internal use only. It is required during
 * the transition period as we are moving to adopt the new storefront API object
 * schema.
 */
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
