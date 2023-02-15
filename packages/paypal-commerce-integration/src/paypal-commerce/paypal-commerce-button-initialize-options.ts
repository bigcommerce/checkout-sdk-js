import { PayPalButtonStyleOptions, PayPalBuyNowInitializeOptions } from '../paypal-commerce-types';

/**
 * A set of options that are required to initialize PayPalCommerce in cart or product details page.
 *
 * When PayPalCommerce is initialized, an PayPalCommerce button will be inserted into the
 * DOM. When a customer clicks on it, it will trigger Apple sheet.
 */
export default interface PayPalCommerceButtonInitializeOptions {
    /**
     * The options that are required to initialize Buy Now functionality.
     */
    buyNowInitializeOptions?: PayPalBuyNowInitializeOptions;

    /**
     * The option that used to initialize a PayPal script with provided currency code.
     */
    currencyCode?: string;

    /**
     * // TODO: this flag should be removed, because the strategy does not used on checkout page
     * // and it always equals to 'false'
     * Flag which helps to detect that the strategy initializes on Checkout page.
     */
    initializesOnCheckoutPage?: boolean;

    /**
     * A set of styling options for the checkout button.
     */
    style?: PayPalButtonStyleOptions;

    /**
     * A callback that gets called when payment complete on paypal side.
     */
    onComplete?(): void;
}

export interface WithPayPalCommerceButtonInitializeOptions {
    paypalcommerce?: PayPalCommerceButtonInitializeOptions;
}
