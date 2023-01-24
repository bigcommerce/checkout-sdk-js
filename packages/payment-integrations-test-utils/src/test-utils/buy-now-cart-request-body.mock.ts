import {
    BuyNowCartRequestBody,
    CartSource,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

export default function getBuyNowCartRequestBody(): BuyNowCartRequestBody {
    return {
        lineItems: [
            {
                productId: 1,
                quantity: 1,
            },
        ],
        source: CartSource.BuyNow,
    };
}
