export default interface InternalLineItem {
    amount: number;
    amountAfterDiscount: number;
    attributes: Array<{ name: string, value: string }>;
    discount: number;
    id: number;
    imageUrl: string;
    integerAmount: number;
    integerAmountAfterDiscount: number;
    integerDiscount: number;
    integerTax: number;
    name: string;
    quantity: number;
    tax: number;
    type: string;
    variantId: number;
}
