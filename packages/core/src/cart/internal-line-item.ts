export default interface InternalLineItem {
    amount: number;
    amountAfterDiscount: number;
    attributes: Array<{ name: string; value: string }>;
    discount: number;
    integerAmount: number;
    downloadsPageUrl?: string;
    integerAmountAfterDiscount: number;
    integerDiscount: number;
    integerUnitPrice: number;
    integerUnitPriceAfterDiscount: number;
    id: string | number;
    imageUrl: string;
    name?: string;
    quantity: number;
    brand?: string;
    sku?: string;
    categoryNames?: string[];
    type: string;
    variantId: number | null;
    productId?: number;
    addedByPromotion?: boolean;
    sender?: {
        name: string;
        email: string;
    };
    recipient?: {
        name: string;
        email: string;
    };
}
