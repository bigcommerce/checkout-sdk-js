import { BuyNowCartRequestBody } from '../../../cart';
import { PaypalStyleOptions } from '../../../payment/strategies/paypal-commerce';

export interface PaypalCommerceButtonInitializeOptions {
    /**
     * A set of styling options for the checkout button.
     */
    style?: PaypalStyleOptions;

    /**
     * Flag which helps to detect that the strategy initializes on Checkout page.
     */
    initializesOnCheckoutPage?: boolean;

    /**
     * The option that used to initialize a PayPal script with provided currency code.
     */
    currencyCode?: string;

    /**
     * The options that are required to initialize Buy Now functionality.
     */
    buyNowInitializeOptions?: {
        getBuyNowCartRequestBody?(): BuyNowCartRequestBody | void;
    };

    /**
     * A callback that gets called when payment complete on paypal side.
     */
    onComplete?(): void;
}
