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
     * Sub total label to be passed to apple sheet.
     */
     subtotalLabel?: string;
}
