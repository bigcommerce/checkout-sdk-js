import { BirthDate, PayPalCommerceFieldsStyleOptions } from '../paypal-commerce-types';

/**
 * A set of options that are required to initialize the PayPal Commerce payment
 * method for presenting its PayPal button.
 *
 * Please note that the minimum version of checkout-sdk is 1.100
 *
 * Also, PayPal (also known as PayPal Commerce Platform) requires specific options to initialize the PayPal Smart Payment Button on checkout page that substitutes a standard submit button
 * ```html
 * <!-- This is where the PayPal button will be inserted -->
 * <div id="container"></div>
 * <!-- This is where the PayPal alternative payment methods fields will be inserted.  -->
 * <div id="apm-fields-container"></div>
 * ```
 *
 * ```js
 * service.initializePayment({
 *     gatewayId: 'paypalcommercealternativemethods',
 *     methodId: 'sepa',
 *     paypalcommercealternativemethods: {
 *         container: '#container',
 *         apmFieldsContainer: '#apm-fields-container',
 *         apmFieldsStyles: {
 *             base: {
 *                 backgroundColor: 'transparent',
 *             },
 *             input: {
 *                 backgroundColor: 'white',
 *                 fontSize: '1rem',
 *                 color: '#333',
 *                 borderColor: '#d9d9d9',
 *                 borderRadius: '4px',
 *                 borderWidth: '1px',
 *                 padding: '1rem',
 *             },
 *             invalid: {
 *                 color: '#ed6a6a',
 *             },
 *             active: {
 *                 color: '#4496f6',
 *             },
 *         },
 *         clientId: 'YOUR_CLIENT_ID',
 * // Callback for submitting payment form that gets called when a buyer approves PayPal payment
 *         submitForm: () => {
 *         // Example function
 *             this.submitOrder(
 *                {
 *                   payment: { methodId: 'paypalcommercealternativemethods', }
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
export default interface PayPalCommerceAlternativeMethodsPaymentOptions {
    /**
     * The CSS selector of a container where the payment widget should be inserted into.
     */
    container: string;

    /**
     * The CSS selector of a container where the alternative payment methods fields widget should be inserted into.
     * It's necessary to specify this parameter when using Alternative Payment Methods.
     * Without it alternative payment methods will not work.
     */
    apmFieldsContainer?: string;

    /**
     * Object with styles to customize alternative payment methods fields.
     */
    apmFieldsStyles?: PayPalCommerceFieldsStyleOptions;

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

export interface PaypalCommerceRatePay {
    /**
     * The CSS selector of a container where the payment widget should be inserted into.
     */
    container: string;

    /**
     * The CSS selector of a container where the legal text should be inserted into.
     */
    legalTextContainer: string;

    /**
     * A callback that gets form values
     */
    getFieldsValues?(): {
        ratepayBirthDate: BirthDate;
        ratepayPhoneNumber: string;
        ratepayPhoneCountryCode: string;
    };

    /**
     * A callback right before render Smart Payment Button that gets called when
     * Smart Payment Button is eligible. This callback can be used to hide the standard submit button.
     */
    onRenderButton?(): void;

    /**
     * A callback for displaying error popup. This callback requires error object as parameter.
     */
    onError?(error: unknown): void;
}

export interface WithPayPalCommerceAlternativeMethodsPaymentInitializeOptions {
    paypalcommerce?: PayPalCommerceAlternativeMethodsPaymentOptions; // FIXME: this option is deprecated
    paypalcommercealternativemethods?: PayPalCommerceAlternativeMethodsPaymentOptions;
    paypalcommerceratepay?: PaypalCommerceRatePay;
}
