/**
 * A set of options that are required to initialize the customer step of
 * checkout to support PayPalCommerce.
 */
export default interface PayPalCommerceCustomerInitializeOptions {
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
     * A callback that gets called when payment complete on paypal side.
     */
    onComplete?(): void;

    /**
     * A callback that gets called when paypal button clicked.
     */
    onClick?(): void;
}

export interface WithPayPalCommerceCustomerInitializeOptions {
    /**
     * The options that are required to initialize the customer step of checkout
     * when using PayPalCommerce.
     */
    paypalcommerce?: PayPalCommerceCustomerInitializeOptions;
}
