import {
    BigCommerceButtonStyleOptions,
    BigCommerceBuyNowInitializeOptions,
} from '../big-commerce-types';

export default interface BigCommerceAlternativeMethodsButtonOptions {
    /**
     * Alternative payment method id what used for initialization BigCommerce button as funding source.
     */
    apm: string;

    /**
     * The options that required to initialize Buy Now functionality.
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
     *
     *  A callback that gets called when BigCommerce SDK restricts to render BigCommerce component.
     *
     */
    onEligibilityFailure?(): void;
}

export interface WithBigCommerceAlternativeMethodsButtonInitializeOptions {
    bigcommerce_payments_apms?: BigCommerceAlternativeMethodsButtonOptions;
}
