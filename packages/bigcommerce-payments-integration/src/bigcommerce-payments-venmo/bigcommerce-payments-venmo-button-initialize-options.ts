import {
    PayPalButtonStyleOptions,
    PayPalBuyNowInitializeOptions,
} from '../bigcommerce-payments-types';

export default interface BigCommercePaymentsVenmoButtonInitializeOptions {
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

    /**
     *
     *  A callback that gets called when PayPal SDK restricts to render PayPal component.
     *
     */
    onEligibilityFailure?(): void;
}

export interface WithBigCommercePaymentsVenmoButtonInitializeOptions {
    bigcommerce_payments_venmo?: BigCommercePaymentsVenmoButtonInitializeOptions;
}
