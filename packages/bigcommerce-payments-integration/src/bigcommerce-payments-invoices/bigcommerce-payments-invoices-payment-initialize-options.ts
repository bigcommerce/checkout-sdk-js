/**
 * A set of options that are required to initialize the BigCommercePayments Invoices payment
 * method.
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'bigcommerce_payments_invoices',
 *     bigcommerce_payments_invoices: {},
 * });
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export default interface BigCommercePaymentsInvoicesPaymentInitializeOptions {}

export interface WithBigCommercePaymentsInvoicesPaymentInitializeOptions {
    bigcommerce_payments_invoices?: BigCommercePaymentsInvoicesPaymentInitializeOptions;
}
