import { BraintreeVerifyPayload } from './braintree';

/**
 * A set of options that are required to initialize the Braintree payment
 * method. You need to provide the options if you want to support 3D Secure
 * authentication flow.
 */
export interface BraintreePaymentInitializeOptions {
    threeDSecure?: BraintreeThreeDSecureOptions;

    /**
     * @alpha
     * Please note that this option is currently in an early stage of
     * development. Therefore the API is unstable and not ready for public
     * consumption.
     */
    form?: BraintreeFormOptions;
}

/**
 * A set of options that are required to support 3D Secure authentication flow.
 *
 * If the customer uses a credit card that has 3D Secure enabled, they will be
 * asked to verify their identity when they pay. The verification is done
 * through a web page via an iframe provided by the card issuer.
 */
export interface BraintreeThreeDSecureOptions {
    /**
     * A callback that gets called when the iframe is ready to be added to the
     * current page. It is responsible for determining where the iframe should
     * be inserted in the DOM.
     *
     * @param error - Any error raised during the verification process;
     * undefined if there is none.
     * @param iframe - The iframe element containing the verification web page
     * provided by the card issuer.
     * @param cancel - A function, when called, will cancel the verification
     * process and remove the iframe.
     */
    addFrame(error: Error | undefined, iframe: HTMLIFrameElement, cancel: () => Promise<BraintreeVerifyPayload> | undefined): void;

    /**
     * A callback that gets called when the iframe is about to be removed from
     * the current page.
     */
    removeFrame(): void;
}

export interface BraintreeFormOptions {
    fields: BraintreeFormFieldsMap | BraintreeStoredCardFieldsMap;
    styles?: BraintreeFormFieldStylesMap;
    onBlur?(data: BraintreeFormFieldBlurEventData): void;
    onCardTypeChange?(data: BraintreeFormFieldCardTypeChangeEventData): void;
    onFocus?(data: BraintreeFormFieldFocusEventData): void;
    onValidate?(data: BraintreeFormFieldValidateEventData): void;
    onEnter?(data: BraintreeFormFieldEnterEventData): void;
}

export enum BraintreeFormFieldType {
    CardCode = 'cardCode',
    CardCodeVerification = 'cardCodeVerification',
    CardExpiry = 'cardExpiry',
    CardName = 'cardName',
    CardNumber = 'cardNumber',
    CardNumberVerification = 'cardNumberVerification',
}

export interface BraintreeFormFieldsMap {
    [BraintreeFormFieldType.CardCode]?: BraintreeFormFieldOptions;
    [BraintreeFormFieldType.CardExpiry]: BraintreeFormFieldOptions;
    [BraintreeFormFieldType.CardName]: BraintreeFormFieldOptions;
    [BraintreeFormFieldType.CardNumber]: BraintreeFormFieldOptions;
}

export interface BraintreeStoredCardFieldsMap {
    [BraintreeFormFieldType.CardCodeVerification]?: BraintreeStoredCardFieldOptions;
    [BraintreeFormFieldType.CardNumberVerification]?: BraintreeStoredCardFieldOptions;
}

export interface BraintreeFormFieldOptions {
    containerId: string;
    placeholder?: string;
}

export interface BraintreeStoredCardFieldOptions extends BraintreeFormFieldOptions {
    instrumentId: string;
}

export interface BraintreeFormFieldStylesMap {
    default?: BraintreeFormFieldStyles;
    error?: BraintreeFormFieldStyles;
    focus?: BraintreeFormFieldStyles;
}

export type BraintreeFormFieldStyles = Partial<Pick<
    CSSStyleDeclaration,
    'color' |
    'fontFamily' |
    'fontSize' |
    'fontWeight'
>>;

export interface BraintreeFormFieldKeyboardEventData {
    fieldType: string;
}

export type BraintreeFormFieldBlurEventData = BraintreeFormFieldKeyboardEventData;
export type BraintreeFormFieldEnterEventData = BraintreeFormFieldKeyboardEventData;
export type BraintreeFormFieldFocusEventData = BraintreeFormFieldKeyboardEventData;

export interface BraintreeFormFieldCardTypeChangeEventData {
    cardType?: string;
}

export interface BraintreeFormFieldValidateEventData {
    errors: {
        [BraintreeFormFieldType.CardCode]?: BraintreeFormFieldValidateErrorData[];
        [BraintreeFormFieldType.CardExpiry]?: BraintreeFormFieldValidateErrorData[];
        [BraintreeFormFieldType.CardName]?: BraintreeFormFieldValidateErrorData[];
        [BraintreeFormFieldType.CardNumber]?: BraintreeFormFieldValidateErrorData[];
        [BraintreeFormFieldType.CardCodeVerification]?: BraintreeFormFieldValidateErrorData[];
        [BraintreeFormFieldType.CardNumberVerification]?: BraintreeFormFieldValidateErrorData[];
    };
    isValid: boolean;
}

export interface BraintreeFormFieldValidateErrorData {
    fieldType: string;
    message: string;
    type: string;
}
