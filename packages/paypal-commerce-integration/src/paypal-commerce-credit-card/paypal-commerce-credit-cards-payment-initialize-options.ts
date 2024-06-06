import { HostedFormOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';

/**
 * A set of options that are required to initialize the PayPal Commerce payment
 * method for presenting its credit card form.
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
 *     methodId: 'paypalcommercecreditcard',
 *     paypalcommercecreditcard: {
 *         form: {
 *             fields: {
 *                 cardNumber: { containerId: 'card-number' },
 *                 cardName: { containerId: 'card-name' },
 *                 cardExpiry: { containerId: 'card-expiry' },
 *                 cardCode: { containerId: 'card-code' },
 *             },
 *         },
 *         onCreditCardFieldsRenderingError: (error) => handleError(error),
 *     },
 * });
 * ```
 *
 * Additional options can be passed in to customize the fields and register
 * event callbacks.
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'paypalcommercecreditcard',
 *     paypalcommercecreditcard: {
 *         form: {
 *             fields: {
 *                 cardNumber: { containerId: 'card-number', placeholder: 'Number of card' },
 *                 cardName: { containerId: 'card-name', placeholder: 'Name of card' },
 *                 cardExpiry: { containerId: 'card-expiry', placeholder: 'Expiry of card' },
 *                 cardCode: { containerId: 'card-code', placeholder: 'Code of card' },
 *             },
 *             styles: {
 *                 default: {
 *                     color: '#000',
 *                 },
 *                 error: {
 *                     color: '#f00',
 *                 },
 *                 focus: {
 *                     color: '#0f0',
 *                 },
 *             },
 *             onBlur({ fieldType }) {
 *                 console.log(fieldType);
 *             },
 *             onFocus({ fieldType }) {
 *                 console.log(fieldType);
 *             },
 *             onEnter({ fieldType }) {
 *                 console.log(fieldType);
 *             },
 *             onCardTypeChange({ cardType }) {
 *                 console.log(cardType);
 *             },
 *             onValidate({ errors, isValid }) {
 *                 console.log(errors);
 *                 console.log(isValid);
 *             },
 *         },
 *         onCreditCardFieldsRenderingError: (error) => handleError(error),
 *     },
 * });
 * ```
 */
export default interface PayPalCommerceCreditCardsPaymentInitializeOptions {
    /**
     * The form is data for Credit Card Form
     */
    form: HostedFormOptions;

    /**
     * The callback that gets called when there is an issue with rendering credit card fields
     */
    onCreditCardFieldsRenderingError?: (error: unknown) => void;
}

// TODO: this interface should be removed
// We should give some time for other developers to update their PPC CC components
// with paypalcommercecreditcard.form instead of paypalcommerce.form.
// The interface can be removed after 14.06.2023
export interface DeprecatedPayPalCommerceCreditCardsPaymentInitializeOptions {
    /**
     * The form is data for Credit Card Form
     */
    form?: HostedFormOptions;

    /**
     * The callback that gets called when there is an issue with rendering credit card fields
     */
    onCreditCardFieldsRenderingError?: (error: unknown) => void;
}

export interface WithPayPalCommerceCreditCardsPaymentInitializeOptions {
    paypalcommercecreditcards?: PayPalCommerceCreditCardsPaymentInitializeOptions;
    paypalcommerce?: DeprecatedPayPalCommerceCreditCardsPaymentInitializeOptions; // FIXME: the option is deprecated
}
