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
     * // TODO: this flag should be removed, because the strategy does not used on checkout page
     * // and it always equals to 'false'
     * Flag which helps to detect that the strategy initializes on Checkout page
     */
    initializesOnCheckoutPage?: boolean;

    /**
     * A set of styling options for the checkout button.
     */
    style?: PayPalButtonStyleOptions;
}

export interface WithPayPalCommerceAlternativeMethodsButtonOptions {
    paypalcommercealternativemethods?: PayPalCommerceAlternativeMethodsButtonOptions;
}
