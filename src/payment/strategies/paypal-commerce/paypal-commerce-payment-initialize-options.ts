import { PaypalButtonStyleOptions } from './paypal-commerce-sdk';

/**
 * A set of options that are required to initialize the PayPal Commerce payment
 * method for presenting its PayPal button.
 *
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
 *         submitForm: () => {
 *             service.submitOrder({
 *                 methodId: 'paypalcommerce',
 *             });
 *         },
 *     },
 * });
 * ```
 */
export interface PaypalCommercePaymentInitializeOptions {
    container: string;
    style?: PaypalButtonStyleOptions;
    onValidate(resolve: () => void, reject: () => void): Promise<void>;
    submitForm(): void;
    onRenderButton?(): void;
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
 *                 cardNumber: { containerId: 'card-number' },
 *                 cardName: { containerId: 'card-name' },
 *                 cardExpiry: { containerId: 'card-expiry' },
 *                 cardCode: { containerId: 'card-code' },
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
 *
 * @alpha
 * Please note that this option is currently in an early stage of
 * development. Therefore the API is unstable and not ready for public
 * consumption.
 */
export interface PaypalCommerceCreditCardPaymentInitializeOptions {
    form: PaypalCommerceFormOptions;
}

export type PaypalCommerceInitializeOptions = PaypalCommercePaymentInitializeOptions | PaypalCommerceCreditCardPaymentInitializeOptions;

export interface PaypalCommerceFormOptions {
    fields: PaypalCommerceFormFieldsMap | PaypalCommerceStoredCardFieldsMap;
    styles?: PaypalCommerceFormFieldStylesMap;
    onBlur?(data: PaypalCommerceFormFieldBlurEventData): void;
    onCardTypeChange?(data: PaypalCommerceFormFieldCardTypeChangeEventData): void;
    onFocus?(data: PaypalCommerceFormFieldFocusEventData): void;
    onValidate?(data: PaypalCommerceFormFieldValidateEventData): void;
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
