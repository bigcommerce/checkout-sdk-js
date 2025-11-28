/**
 * A set of options that are required to initialize the BigCommercePayments payment
 * method making payment with Klarna.
 *
 *
 * Also, BCP (also known as BigCommercePayments) requires specific options to initialize the PayPal Klarna flow
 *
 * ```js
 * service.initializePayment({
 *     gatewayId: 'bigcommerce_payments_apms',
 *     methodId: 'klarna',
 *     bigcommerce_payments_apms: {
 * // Callback for handling error that occurs when a buyer approves payment
 *         onError: (error) => {
 *         // Example function
 *             this.handleError(
 *                {
 *                   payment: { methodId: 'bigcommerce_payments_apms', }
 *               }
 *            );
 *         },
 *     },
 * });
 * ```
 */
export default interface BigCommercePaymentsRedirectAlternativeMethodsPaymentInitializeOptions {
    /**
     * A callback for displaying error popup. This callback requires error object as parameter.
     */
    onError?(error: Error | unknown): void;
}

export interface WithBigCommercePaymentsRedirectAlternativeMethodsPaymentInitializeOptions {
    bigcommerce_payments_apms?: BigCommercePaymentsRedirectAlternativeMethodsPaymentInitializeOptions;
}
