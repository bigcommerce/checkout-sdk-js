"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function mapToInternalGiftCertificate(giftCertificate, existingGiftCertificate) {
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
exports.default = mapToInternalGiftCertificate;
//# sourceMappingURL=map-to-internal-gift-certificate.js.map