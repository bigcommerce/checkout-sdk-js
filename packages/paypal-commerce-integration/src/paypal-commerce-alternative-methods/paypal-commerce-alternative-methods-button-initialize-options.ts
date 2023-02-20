import { PayPalButtonStyleOptions, PayPalBuyNowInitializeOptions } from '../paypal-commerce-types';

export default interface PayPalCommerceAlternativeMethodsButtonOptions {
    /**
     * Alternative payment method id what used for initialization PayPal button as funding source.
     */
    apm: string;

    /**
     * The options that required to initialize Buy Now functionality.
     */
    buyNowInitializeOptions?: PayPalBuyNowInitializeOptions;

    /**
     * The option that used to initialize a PayPal script with provided currency code.
     */
    currencyCode?: string;

    /**
     * A set of styling options for the checkout button.
     */
    style?: PayPalButtonStyleOptions;
}

export interface WithPayPalCommerceAlternativeMethodsButtonOptions {
    paypalcommercealternativemethods?: PayPalCommerceAlternativeMethodsButtonOptions;
}
