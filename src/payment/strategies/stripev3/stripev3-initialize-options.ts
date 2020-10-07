import { IndividualCardElementOptions, StripeElementOptions } from './stripev3';

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
 *     methodId: 'stripev3',
 *     stripev3: {
 *         containerId: 'container',
 *     },
 * });
 * ```
 *
 * Additional options can be passed in to customize the fields.
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'stripev3',
 *     stripev3: {
 *         containerId: 'container',
 *         options: {
 *             card: {
 *                 classes: { base: 'form-input' },
 *             },
 *             iban: {
 *                 classes: { base: 'form-input' },
 *                 supportedCountries: ['SEPA],
 *             },
 *             idealBank: {
 *                 classes: { base: 'form-input' },
 *             },
 *         },
 *     },
 * });
 * ```
 */

export default interface StripeV3PaymentInitializeOptions {
    /**
     * The location to insert the credit card number form field.
     */
    containerId: string;

    options?: StripeElementOptions | IndividualCardElementOptions;
}
