/**
 * A set of options that are required to initialize the Stripe payment method.
 *
 * Once Stripe payment is initialized, credit card form fields, provided by the
 * payment provider as iframes, will be inserted into the current page. These
 * options provide a location and styling for each of the form fields.
 *
 * ```html
 * <!-- This is where the credit card component will be inserted -->
 * <div id="container"></div>
 * ```
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'stripeupe',
 *     stripeupe {
 *         containerId: 'container',
 *     },
 * });
 * ```
 */

export default interface StripeUPEPaymentInitializeOptions {
    /**
     * The location to insert the credit card number form field.
     */
    containerId: string;

    /**
     * The location to insert the preloader while waiting for Stripe confirmation.
     */
    loaderContainerId?: string;

    /**
     * Checkout styles from store theme
     */
    style?: {
        [key: string]: string;
    };
    onError?(error?: Error): void;

    render(): void;
}
