/**
 * A set of options that are required to initialize the BigCommercePayments  payment
 * method for presenting its BigCommercePayments button.
 *
 * Please note that the minimum version of checkout-sdk is 1.100
 *
 * Also, BigCommercePayments (also known as BigCommercePayments  Platform) requires specific options to initialize the BigCommercePayments Smart Payment Button on checkout page that substitutes a standard submit button
 * ```html
 * <!-- This is where the BigCommercePayments button will be inserted -->
 * <div id="container"></div>
 * ```
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'bigcommerce_payments_paylater',
 *     bigcommerce_payments_paylater: {
 *         container: '#container',
 * // Callback for submitting payment form that gets called when a buyer approves BigCommercePayments payment
 *         submitForm: () => {
 *         // Example function
 *             this.submitOrder(
 *                {
 *                   payment: { methodId: 'bigcommerce_payments_paylater', }
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
 * // Callback that is called right before render of a Smart Payment Button. It gets called when a buyer is eligible for use of the particular BigCommercePayments method. This callback can be used to hide the standard submit button.
 *         onRenderButton: () => {
 *         // Example function
 *             this.hidePaymentSubmitButton();
 *         }
 *     },
 * });
 * ```
 */
export default interface BigCommercePaymentsPayLaterPaymentInitializeOptions {
    /**
     * The CSS selector of a container where the payment widget should be inserted into.
     */
    container?: string;

    /**
     * The location to insert the Pay Later Messages.
     */
    bannerContainerId?: string;

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
    onValidate?(resolve: () => void, reject: () => void): Promise<void>;

    /**
     * A callback for submitting payment form that gets called
     * when buyer approved BigCommercePayments account.
     */
    submitForm?(): void;
}

export interface WithBigCommercePaymentsPayLaterPaymentInitializeOptions {
    bigcommerce_payments_paypal?: BigCommercePaymentsPayLaterPaymentInitializeOptions; // FIXME: this option is deprecated
    bigcommerce_payments_paylater?: BigCommercePaymentsPayLaterPaymentInitializeOptions;
}
