/**
 * A set of options that are required to initialize the customer step of
 * checkout in order to support ApplePay.
 *
 * When ApplePay is initialized, a sign-in button will be inserted into the
 * DOM. When the customer clicks on it, it will trigger apple sheet
 */
export default interface ApplePayCustomerInitializeOptions {
    /**
     * The ID of a container which the sign-in button should insert into.
     */
    container: string;

    /**
     * Shipping label to be passed to apple sheet.
     */
    shippingLabel?: string;

    /**
     * Sub total label to be passed to apple sheet.
     */
    subtotalLabel?: string;

    /**
     * A callback that gets called when a payment is successfully completed.
     */
    onPaymentAuthorize(): void;

    /**
     * A callback that gets called if unable to initialize the widget or select
     * one of the address options provided by the widget.
     *
     * @param error - The error object describing the failure.
     */
    onError?(error?: Error): void;

    /**
     * A callback that gets called when wallet button clicked
     */
    onClick?(): void;
}

export interface WithApplePayCustomerInitializeOptions {
    /**
     * The options that are required to initialize the customer step of checkout
     * when using ApplePay.
     */
    applepay?: ApplePayCustomerInitializeOptions;
}
