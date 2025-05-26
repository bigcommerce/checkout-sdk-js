import {
    PayPalButtonStyleOptions,
    PayPalBuyNowInitializeOptions,
} from '../bigcommerce-payments-types';

export default interface BigCommercePaymentsPayLaterButtonInitializeOptions {
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

    /**
     *
     *  A callback that gets called when PayPal SDK restricts to render PayPal component.
     *
     */
    onEligibilityFailure?(): void;
}

export interface WithBigCommercePaymentsPayLaterButtonInitializeOptions {
    bigcommerce_payments_paylater?: BigCommercePaymentsPayLaterButtonInitializeOptions;
}
