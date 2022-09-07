import { PaypalButtonStyleOptions } from '../../../payment/strategies/paypal-commerce';

export interface PaypalCommerceInlineCheckoutButtonInitializeOptions {
    /**
     * Accelerated Checkout Buttons container - is a generic container for all AC buttons
     * Used as a container where the button will be rendered with its own container
     * Example: 'data-cart-accelerated-checkout-buttons'
     * Info: we are using data attributes as an identifier because the buttons can be rendered in several places on the page
     */
    acceleratedCheckoutContainerDataId: string;

    /**
     * A container identifier what used to add special class for container where the button will be generated in
     * Example: 'data-paypal-commerce-inline-button'
     * Info: we are using data attributes as an identifier because the buttons can be rendered in several places on the page
     */
    buttonContainerDataId: string;

    /**
     * A class name used to add special class for container where the button will be generated in
     * Default: 'PaypalCommerceInlineButton'
     */
    buttonContainerClassName?: string;

    /**
     * Used by Accelerated Checkout strategy to hide primary action button before rendering PayPal inline checkout button
     * Example: 'data-checkout-now-button'
     * Info: we are using data attributes as an identifier because the buttons can be rendered in several places on the page
     */
    checkoutNowElementDataId: string;

    /**
     * A set of styling options for the checkout button.
     */
    style?: PaypalButtonStyleOptions;

    /**
     * A callback that gets called when payment complete on paypal side.
     */
    onComplete(): void;
}
