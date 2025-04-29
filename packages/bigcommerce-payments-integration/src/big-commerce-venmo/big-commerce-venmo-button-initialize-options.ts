import {
    BigCommerceButtonStyleOptions,
    BigCommerceBuyNowInitializeOptions,
} from '../big-commerce-types';

export default interface BigCommerceVenmoButtonInitializeOptions {
    /**
     * A set of styling options for the checkout button.
     */
    style?: BigCommerceButtonStyleOptions;

    /**
     * The option that used to initialize a BigCommerce script with provided currency code.
     */
    currencyCode?: string;

    /**
     * The options that required to initialize Buy Now functionality.
     */
    buyNowInitializeOptions?: BigCommerceBuyNowInitializeOptions;

    /**
     *
     *  A callback that gets called when BigCommerce SDK restricts to render BigCommerce component.
     *
     */
    onEligibilityFailure?(): void;
}

export interface WithBigCommerceVenmoButtonInitializeOptions {
    bigcommercevenmo?: BigCommerceVenmoButtonInitializeOptions;
}
