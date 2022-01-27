/**
 * A set of options that are required to initialize ApplePay in cart.
 *
 * When ApplePay is initialized, an ApplePay button will be inserted into the
 * DOM. When a customer clicks on it, it will trigger Apple sheet.
 */
 export default interface ApplePayButtonInitializeOptions {
    /**
     * The ID of a container which the sign-in button should insert into.
     */
    container: string;

    /**
     * The class name of the ApplePay button style.
     */
    buttonClassName?: string;

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
}
