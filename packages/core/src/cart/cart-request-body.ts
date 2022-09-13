/**
 * An object that contains the information required for creating cart.
 */
export default interface CartRequestBody {
    locale?: string; // TODO: do I really need this one?
    source?: string; // TODO: Update with data type
    lineItems: Array<{
        productId: number;
        quantity: number;
        optionSelections?: {
            optionId: number;
            optionValue: number | string;
        };
    }>;
}
