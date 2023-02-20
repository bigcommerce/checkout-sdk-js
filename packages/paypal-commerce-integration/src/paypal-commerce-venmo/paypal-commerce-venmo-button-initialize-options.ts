import { PayPalButtonStyleOptions, PayPalBuyNowInitializeOptions } from '../paypal-commerce-types';

export default interface PayPalCommerceVenmoButtonInitializeOptions {
    /**
     * A set of styling options for the checkout button.
     */
    style?: PayPalButtonStyleOptions;

    /**
     * The option that used to initialize a PayPal script with provided currency code.
     */
    currencyCode?: string;

    /**
     * The options that required to initialize Buy Now functionality.
     */
    buyNowInitializeOptions?: PayPalBuyNowInitializeOptions;
}

export interface WithPayPalCommerceVenmoButtonInitializeOptions {
    paypalcommercevenmo?: PayPalCommerceVenmoButtonInitializeOptions;
}
