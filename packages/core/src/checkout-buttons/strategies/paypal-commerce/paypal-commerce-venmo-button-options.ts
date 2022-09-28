import { BuyNowCartRequestBody } from '../../../cart';
import { PaypalButtonStyleOptions } from '../../../payment/strategies/paypal-commerce';

export interface PaypalCommerceVenmoButtonInitializeOptions {
    /**
     * A set of styling options for the checkout button.
     */
    style?: PaypalButtonStyleOptions;

    /**
     * Flag which helps to detect that the strategy initializes on Checkout page
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
    }
}
