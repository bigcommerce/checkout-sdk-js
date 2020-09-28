import { NonceGenerationError, SquareFormElement } from './square-form';

/**
 * A set of options that are required to initialize the Square payment method.
 *
 * Once Square payment is initialized, credit card form fields, provided by the
 * payment provider as iframes, will be inserted into the current page. These
 * options provide a location and styling for each of the form fields.
 *
 * ```html
 * <!-- These containers are where the hosted (iframed) credit card fields will be inserted -->
 * <div id="card-number"></div>
 * <div id="card-name"></div>
 * <div id="card-expiry"></div>
 * <div id="card-code"></div>
 * ```
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'squarev2',
 *     square: {
 *         cardNumber: {
 *             elementId: 'card-number',
 *         },
 *         cvv: {
 *             elementId: 'card-code',
 *         },
 *         expirationDate: {
 *             elementId: 'card-expiry',
 *         },
 *         postalCode: {
 *             elementId: 'card-code',
 *         },
 *     },
 * });
 * ```
 *
 * Additional options can be passed in to enable Masterpass (if configured for
 * the account) and customize the fields.
 *
 * ```html
 * <!-- This container is where Masterpass button will be inserted -->
 * <div id="masterpass"></div>
 * ```
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'squarev2',
 *     square: {
 *         cardNumber: {
 *             elementId: 'card-number',
 *         },
 *         cvv: {
 *             elementId: 'card-code',
 *         },
 *         expirationDate: {
 *             elementId: 'card-expiry',
 *         },
 *         postalCode: {
 *             elementId: 'card-code',
 *         },
 *         inputClass: 'form-input',
 *         inputStyles: [
 *             {
 *                 color: '#333',
 *                 fontSize: '13px',
 *                 lineHeight: '20px',
 *             },
 *         ],
 *         masterpass: {
 *             elementId: 'masterpass',
 *         },
 *     },
 * });
 * ```
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
