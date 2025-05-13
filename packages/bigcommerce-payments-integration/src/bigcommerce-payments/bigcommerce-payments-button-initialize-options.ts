import {
    PayPalButtonStyleOptions,
    PayPalBuyNowInitializeOptions,
} from '../bigcommerce-payments-types';

/**
 * A set of options that are required to initialize BigCommercePayments in cart or product details page.
 *
 * When BigCommercePayments is initialized, an BigCommercePayments button will be inserted into the
 * DOM. When a customer clicks on it, it will trigger Apple sheet.
 */
export default interface BigCommercePaymentsButtonInitializeOptions {
    /**
     * The options that are required to initialize Buy Now functionality.
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

export interface WithBigCommercePaymentsButtonInitializeOptions {
    bigcommerce_payments_paypal?: BigCommercePaymentsButtonInitializeOptions;
}
