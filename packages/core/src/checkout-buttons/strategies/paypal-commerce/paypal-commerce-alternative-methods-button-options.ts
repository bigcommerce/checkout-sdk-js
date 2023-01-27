import { BuyNowCartRequestBody } from '../../../cart';
import { PaypalStyleOptions } from '../../../payment/strategies/paypal-commerce';

export interface PaypalCommerceAlternativeMethodsButtonOptions {
    /**
     * Alternative payment method id what used for initialization PayPal button as funding source.
     */
    apm: string;

    /**
     * Flag which helps to detect that the strategy initializes on Checkout page.
     */
    initializesOnCheckoutPage?: boolean;

    /**
     * A set of styling options for the checkout button.
     */
    style?: PaypalStyleOptions;

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
}
