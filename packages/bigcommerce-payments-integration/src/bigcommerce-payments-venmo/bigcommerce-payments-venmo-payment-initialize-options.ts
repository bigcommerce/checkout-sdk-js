/**
 * A set of options that are required to initialize the BigCommercePayments Venmo payment
 * method for presenting its Venmo button.
 *
 *
 * Also, BigCommercePayments requires specific options to initialize the Venmo Button on checkout page that substitutes a standard submit button
 * ```html
 * <!-- This is where the Venmo button will be inserted -->
 * <div id="container"></div>
 * ```
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'bigcommerce_payments_venmo',
 *     bigcommerce_payments_venmo: {
 *         container: '#container',
 * // Callback for submitting payment form that gets called when a buyer approves payment
 *         submitForm: () => {
 *         // Example function
 *             this.submitOrder(
 *                {
 *                   payment: { methodId: 'bigcommerce_payments_venmo', }
 *               }
 *            );
 *         },
 * // Callback is used to define the state of the payment form, validate if it is applicable for submit.
 *         onValidate: (resolve, reject) => {
 *         // Example function
 *             const isValid = this.validatePaymentForm();
 *             if (isValid) {
 *                 return resolve();
 *             }
 *             return reject();
 *         },
 * // Callback that is called right before render of a Smart Payment Button. It gets called when a buyer is eligible for use of the particular PayPal method. This callback can be used to hide the standard submit button.
 *         onRenderButton: () => {
 *         // Example function
 *             this.hidePaymentSubmitButton();
 *         }
 *     },
 * });
 * ```
 */
export default interface BigCommercePaymentsVenmoPaymentInitializeOptions {
    /**
     * The CSS selector of a container where the payment widget should be inserted into.
     */
    container: string;

    /**
     * A callback for displaying error popup. This callback requires error object as parameter.
     */
    onError?(error: Error): void;

    /**
     * A callback right before render Smart Payment Button that gets called when
     * Smart Payment Button is eligible. This callback can be used to hide the standard submit button.
     */
    onRenderButton?(): void;

    /**
     * A callback that gets called when a buyer click on Smart Payment Button
     * and should validate payment form.
     *
     * @param resolve - A function, that gets called if form is valid.
     * @param reject - A function, that gets called if form is not valid.
     *
     * @returns reject() or resolve()
     */
    onValidate(resolve: () => void, reject: () => void): Promise<void>;

    /**
     * A callback for submitting payment form that gets called
     * when buyer approved PayPal account.
     */
    submitForm(): void;
}

export interface WithBigCommercePaymentsVenmoPaymentInitializeOptions {
    bigcommerce_payments_venmo?: BigCommercePaymentsVenmoPaymentInitializeOptions;
}
