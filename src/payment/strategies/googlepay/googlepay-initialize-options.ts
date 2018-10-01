/**
 * A set of options that are required to initialize the GooglePay payment method
 *
 * If the customer chooses to pay with GooglePay, they will be asked to
 * enter their payment details via a modal. You can hook into events emitted by
 * the modal by providing the callbacks listed below.
 */
export default interface GooglePayPaymentInitializeOptions {
    /**
     * This walletButton is used to set an event listener, provide an element ID if you want
     * users to be able to launch the GooglePay wallet modal by clicking on a button.
     * It should be an HTML element.
     */
    walletButton?: string;

    /**
     * A callback that gets called when GooglePay fails to initialize or
     * selects a payment option.
     *
     * @param error - The error object describing the failure.
     */
    onError?(error: Error): void;

    /**
     * A callback that gets called when the customer selects a payment option.
     */
    onPaymentSelect?(): void;
}
