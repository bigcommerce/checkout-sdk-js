export interface PaypalCommercePaymentInitializeOptions {
    overlay?: {
        helpText?: string;
        continueText?: string;
    };

    /**
     * @alpha
     * Please note that this option is currently in an early stage of
     * development. Therefore the API is unstable and not ready for public
     * consumption.
     */
    form?: PaypalCommerceFormOptions;
}

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
