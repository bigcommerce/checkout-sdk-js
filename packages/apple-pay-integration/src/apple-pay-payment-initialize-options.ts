/**
 * A set of options that are required to initialize the Applepay payment method with:
 *
 * 1) ApplePay:
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'applepay',
 *     applepay: {
 *         shippingLabel: 'Shipping',
 *         subtotalLabel: 'Sub total',
 *         onError: (error) => console.error(error),
 *     }
 * });
 * ```
 */
export default interface ApplePayPaymentInitializeOptions {
    /**
     * Shipping label to be passed to apple sheet.
     */
    shippingLabel?: string;

    /**
     * Store credit label to be passed to apple sheet.
     */
    storeCreditLabel?: string;

    /**
     * Sub total label to be passed to apple sheet.
     */
    subtotalLabel?: string;

    /**
     * A callback that gets called if Apple Pay merchant validation fails.
     * When it is provided, the Apple Pay session is aborted and the payment
     * is rejected as cancelled, so the error is shown only once.
     *
     * @param error - The error object describing the failure.
     */
    onError?(error: Error): void;
}

export interface WithApplePayPaymentInitializeOptions {
    /**
     * The options that are required to initialize the Apple Pay payment
     * method. They can be omitted unless you need to support Apple Pay.
     */
    applepay?: ApplePayPaymentInitializeOptions;
}
