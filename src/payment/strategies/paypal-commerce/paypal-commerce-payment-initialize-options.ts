/**
 * A set of options that are required to initialize the PayPal Commerce payment
 * method could be used for PayPal Smart Payment Buttons or PayPal Credit Card methods.
 */
export type PaypalCommerceInitializeOptions = PaypalCommercePaymentInitializeOptions | PaypalCommerceCreditCardPaymentInitializeOptions;

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
 * ```
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'paypalcommerce',
 *     paypalcommerce: {
 *         container: 'container',
 * // Callback for submitting payment form that gets called when a buyer approves PayPal payment
 *         submitForm: () => {
 *             service.submitOrder(
 *                {
 *                   payment: { methodId: 'paypalcommerce', }
 *               }
 *            );
 *         },
 * // Callback is used to define the state of the payment form, validate if it is applicable for submit.
 *         onValidate: (resolve, reject) => {
 *             const isValid = service.validatePaymentForm();
 *             if (isValid) {
 *                 return resolve();
 *             }
 *             return reject();
 *         },
 * // Callback that is called right before render of a Smart Payment Button. It gets called when a buyer is eligible for use of the particular PayPal method. This callback can be used to hide the standard submit button.
 *         onRenderButton: () => {
 *             service.hidePaymentSubmitButton();
 *         }
 *     },
 * });
 * ```
 */
export interface PaypalCommercePaymentInitializeOptions {
    /**
     * The ID of a container where the payment widget should be inserted into.
     */
    container: string;

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

    /**
     * A callback right before render Smart Payment Button that gets called when
     * Smart Payment Button is eligible. This callback can be used to hide the standard submit button.
     */
    onRenderButton?(): void;
    /**
     * A callback for displaying error popup. This callback requires error object as parameter.
     */
    onError?(error: Error): void;
}

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
 *     methodId: 'paypalcommerce',
 *     paypalcommerce: {
 *         form: {
 *             fields: {
 *                 cardNumber: { containerId: 'card-number' },
 *                 cardName: { containerId: 'card-name' },
 *                 cardExpiry: { containerId: 'card-expiry' },
 *                 cardCode: { containerId: 'card-code' },
 *             },
 *         },
 *     },
 * });
 * ```
 *
 * Additional options can be passed in to customize the fields and register
 * event callbacks.
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'paypalcommerce',
 *     creditCard: {
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
 *     },
 * });
 * ```
 */
export interface PaypalCommerceCreditCardPaymentInitializeOptions {
    /**
     * The form is data for Credit Card Form
     */
    form: PaypalCommerceFormOptions;
}

export interface PaypalCommerceFormOptions {
    /**
     * Containers for fields can be to present in one set of values
     *
     * ```js
     * { cardNumber: { containerId: 'card-number' },
     *   cardName: { containerId: 'card-name' },
     *   cardExpiry: { containerId: 'card-expiry' },
     *   cardCode: { containerId: 'card-code' }, }
     * ```
     *
     *   Or in another set of values.
     *
     * ```js
     * { cardCodeVerification: { containerId: 'card-number' },
     *   cardNumberVerification: { containerId: 'card-name' }, }
     * ```
     */
    fields: PaypalCommerceFormFieldsMap | PaypalCommerceStoredCardFieldsMap;

    /**
     * Styles for inputs. Change the width, height and other styling.
     *
     * ```js
     *  default: { color: '#000' },
     *  error: { color: '#f00' },
     *  focus: { color: '#0f0' }
     * ```
     */
    styles?: PaypalCommerceFormFieldStylesMap;

    /**
     * A callback that gets called when a field loses focus.
     */
    onBlur?(data: PaypalCommerceFormFieldBlurEventData): void;

    /**
     * A callback that gets called when activity within
     * the number field has changed such that the possible
     * card type has changed.
     */
    onCardTypeChange?(data: PaypalCommerceFormFieldCardTypeChangeEventData): void;

    /**
     * A callback that gets called when a field gains focus.
     */
    onFocus?(data: PaypalCommerceFormFieldFocusEventData): void;

    /**
     * A callback that gets called when the validity of a field has changed.
     */
    onValidate?(data: PaypalCommerceFormFieldValidateEventData): void;

    /**
     * A callback that gets called when the user requests submission
     * of an input field, by pressing the Enter or Return key
     * on their keyboard, or mobile equivalent.
     */
    onEnter?(data: PaypalCommerceFormFieldEnterEventData): void;
}

export enum PaypalCommerceFormFieldType {
    CardCode = 'cardCode',
    CardCodeVerification = 'cardCodeVerification',
    CardExpiry = 'cardExpiry',
    CardName = 'cardName',
    CardNumber = 'cardNumber',
    CardNumberVerification = 'cardNumberVerification',
}

export interface PaypalCommerceFormFieldsMap {
    [PaypalCommerceFormFieldType.CardCode]?: PaypalCommerceFormFieldOptions;
    [PaypalCommerceFormFieldType.CardExpiry]: PaypalCommerceFormFieldOptions;
    [PaypalCommerceFormFieldType.CardName]: PaypalCommerceFormFieldOptions;
    [PaypalCommerceFormFieldType.CardNumber]: PaypalCommerceFormFieldOptions;
}

export interface PaypalCommerceStoredCardFieldsMap {
    [PaypalCommerceFormFieldType.CardCodeVerification]?: PaypalCommerceStoredCardFieldOptions;
    [PaypalCommerceFormFieldType.CardNumberVerification]?: PaypalCommerceStoredCardFieldOptions;
}

export interface PaypalCommerceFormFieldOptions {
    containerId: string;
    placeholder?: string;
}

export interface PaypalCommerceStoredCardFieldOptions extends PaypalCommerceFormFieldOptions {
    instrumentId: string;
}

export interface PaypalCommerceFormFieldStylesMap {
    default?: PaypalCommerceFormFieldStyles;
    error?: PaypalCommerceFormFieldStyles;
    focus?: PaypalCommerceFormFieldStyles;
}

export type PaypalCommerceFormFieldStyles = Partial<Pick<
    CSSStyleDeclaration,
    'color' |
    'fontFamily' |
    'fontSize' |
    'fontWeight'
    >>;

export interface PaypalCommerceFormFieldKeyboardEventData {
    fieldType: string;
}

export type PaypalCommerceFormFieldBlurEventData = PaypalCommerceFormFieldKeyboardEventData;
export type PaypalCommerceFormFieldEnterEventData = PaypalCommerceFormFieldKeyboardEventData;
export type PaypalCommerceFormFieldFocusEventData = PaypalCommerceFormFieldKeyboardEventData;

export interface PaypalCommerceFormFieldCardTypeChangeEventData {
    cardType?: string;
}

export interface PaypalCommerceFormFieldValidateEventData {
    errors: {
        [PaypalCommerceFormFieldType.CardCode]?: PaypalCommerceFormFieldValidateErrorData[];
        [PaypalCommerceFormFieldType.CardExpiry]?: PaypalCommerceFormFieldValidateErrorData[];
        [PaypalCommerceFormFieldType.CardName]?: PaypalCommerceFormFieldValidateErrorData[];
        [PaypalCommerceFormFieldType.CardNumber]?: PaypalCommerceFormFieldValidateErrorData[];
        [PaypalCommerceFormFieldType.CardCodeVerification]?: PaypalCommerceFormFieldValidateErrorData[];
        [PaypalCommerceFormFieldType.CardNumberVerification]?: PaypalCommerceFormFieldValidateErrorData[];
    };
    isValid: boolean;
}

export interface PaypalCommerceFormFieldValidateErrorData {
    fieldType: string;
    message: string;
    type: string;
}
