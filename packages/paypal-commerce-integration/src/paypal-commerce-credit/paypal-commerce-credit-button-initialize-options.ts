import { PayPalButtonStyleOptions, PayPalBuyNowInitializeOptions } from '../paypal-commerce-types';

export default interface PayPalCommerceCreditButtonInitializeOptions {
    /**
     * Flag which helps to detect that the strategy initializes on Checkout page
     */
    initializesOnCheckoutPage?: boolean;

    /**
     * The ID of a container which the messaging should be inserted.
     */
    messagingContainerId?: string;

    /**
     * A set of styling options for the checkout button.
     */
    style?: PayPalButtonStyleOptions;

    /**
     * The option that used to initialize a PayPal script with provided currency code.
     */
    currencyCode?: string;

    /**
     * The options that are required to initialize Buy Now functionality.
     */
    buyNowInitializeOptions?: PayPalBuyNowInitializeOptions;

    /**
     * A callback that gets called when payment complete on paypal side.
     */
    onComplete?(): void;
}

export interface WithPayPalCommerceCreditButtonInitializeOptions {
    paypalcommercecredit?: PayPalCommerceCreditButtonInitializeOptions;
}
