/**
 * A set of options that are required to initialize the customer step of
 * checkout to support BigCommerce.
 */
export default interface BigCommerceCustomerInitializeOptions {
    /**
     * The ID of a container which the checkout button should be inserted into.
     */
    container: string;

    /**
     * A callback that gets called if unable to initialize the widget or select
     * one of the address options provided by the widget.
     *
     * @param error - The error object describing the failure.
     */
    onError?(error?: Error): void;

    /**
     * A callback that gets called when payment complete on bigCommerce side.
     */
    onComplete?(): void;

    /**
     * A callback that gets called when bigCommerce button clicked.
     */
    onClick?(): void;
}

export interface WithBigCommerceCustomerInitializeOptions {
    /**
     * The options that are required to initialize the customer step of checkout
     * when using BigCommerce.
     */
    bigcommerce?: BigCommerceCustomerInitializeOptions;
}
