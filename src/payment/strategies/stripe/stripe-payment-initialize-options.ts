import { StripeFormElement } from './stripe-form';

/**
 * A set of options that are required to initialize the Square payment method.
 *
 * Once Square payment is initialized, credit card form fields, provided by the
 * payment provider as iframes, will be inserted into the current page. These
 * options provide a location and styling for each of the form fields.
 */
export default interface StripePaymentInitializeOptions {
    /**
     * The location to insert the credit card number form field.
     */
    cardElement: StripeFormElement;

    /**
     * The set of CSS styles to apply to all form fields.
     */
    inputStyles?: any;
}
