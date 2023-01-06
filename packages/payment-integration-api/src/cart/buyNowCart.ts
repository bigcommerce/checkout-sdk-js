interface LineItem {
    productId: number;
    quantity: number;
    optionSelections?: {
        optionId: number;
        optionValue: number | string;
    };
}

/**
 * An object that contains the information required for creating 'Buy now' cart.
 */
export default interface BuyNowCartRequestBody {
    source: 'BUY_NOW';
    lineItems: LineItem[];
}
