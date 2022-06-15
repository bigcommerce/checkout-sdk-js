export default interface InternalGiftCertificate {
    code: string;
    discountedAmount: number;
    remainingBalance: number;
    giftCertificate?: {
        balance: number;
        code: string;
        purchaseDate: string;
    };
}
