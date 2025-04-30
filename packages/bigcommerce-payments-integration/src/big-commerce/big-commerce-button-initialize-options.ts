import {
    BigCommerceButtonStyleOptions,
    BigCommerceBuyNowInitializeOptions,
} from '../big-commerce-types';

/**
 * A set of options that are required to initialize BigCommerce in cart or product details page.
 *
 * When BigCommerce is initialized, an BigCommerce button will be inserted into the
 * DOM. When a customer clicks on it, it will trigger Apple sheet.
 */
export default interface BigCommerceButtonInitializeOptions {
    /**
     * The options that are required to initialize Buy Now functionality.
     */
    buyNowInitializeOptions?: BigCommerceBuyNowInitializeOptions;

    /**
     * The option that used to initialize a BigCommerce script with provided currency code.
     */
    currencyCode?: string;

    /**
     * A set of styling options for the checkout button.
     */
    style?: BigCommerceButtonStyleOptions;

    /**
     * A callback that gets called when payment complete on bigCommerce side.
     */
    onComplete?(): void;

    /**
     *
     *  A callback that gets called when BigCommerce SDK restricts to render BigCommerce component.
     *
     */
    onEligibilityFailure?(): void;
}

export interface WithBigCommerceButtonInitializeOptions {
    bigcommerce_payments_paypal?: BigCommerceButtonInitializeOptions;
}
