import { NonceGenerationError, SquareFormElement } from './square-form';

/**
 * A set of options that are required to initialize the Square payment method.
 *
 * Once Square payment is initialized, credit card form fields, provided by the
 * payment provider as iframes, will be inserted into the current page. These
 * options provide a location and styling for each of the form fields.
 */
export default interface SquarePaymentInitializeOptions {
    /**
     * The location to insert the credit card number form field.
     */
    cardNumber: SquareFormElement;

    /**
     * The location to insert the CVV form field.
     */
    cvv: SquareFormElement;

    /**
     * The location to insert the expiration date form field.
     */
    expirationDate: SquareFormElement;

    /**
     * The location to insert the postal code form field.
     */
    postalCode: SquareFormElement;

    /**
     * The CSS class to apply to all form fields.
     */
    inputClass?: string;

    /**
     * The set of CSS styles to apply to all form fields.
     */
    inputStyles?: Array<{ [key: string]: string }>;

    /**
     * Initialize Masterpass placeholder ID
     */
    masterpass?: SquareFormElement;

    /**
     * A callback that gets called when the customer selects a payment option.
     */
    onPaymentSelect?(): void;

    /**
     * A callback that gets called when an error occurs in the card nonce generation
     */
    onError?(errors?: NonceGenerationError[]): void;
}
