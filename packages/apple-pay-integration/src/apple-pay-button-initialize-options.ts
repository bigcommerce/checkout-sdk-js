import { BuyNowCartRequestBody } from '@bigcommerce/checkout-sdk/payment-integration-api';

/**
 * A set of options that are required to initialize ApplePay in cart.
 *
 * When ApplePay is initialized, an ApplePay button will be inserted into the
 * DOM. When a customer clicks on it, it will trigger Apple sheet.
 */
export default interface ApplePayButtonInitializeOptions {
    /**
     * This option indicates if product requires shipping
     */
    requiresShipping?: boolean;

    /**
     * The options that are required to initialize Buy Now functionality.
     */
    buyNowInitializeOptions?: {
        getBuyNowCartRequestBody?(): BuyNowCartRequestBody | void;
    };

    /**
     * A callback that gets called when a payment is successfully completed.
     */
    onPaymentAuthorize(): void;
}

export interface WithApplePayButtonInitializeOptions {
    applepay?: ApplePayButtonInitializeOptions;
}
