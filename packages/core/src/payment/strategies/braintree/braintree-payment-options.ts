import { BraintreeError } from '@bigcommerce/checkout-sdk/braintree-utils';
import { StandardError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { BraintreeFormErrorsData, BraintreeVerifyPayload } from './braintree';

/**
 * A set of options that are required to initialize the Braintree payment
 * method. You need to provide the options if you want to support 3D Secure
 * authentication flow.
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
 *     methodId: 'braintree',
 *     braintree: {
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
 *     methodId: 'braintree',
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
 */
export interface BraintreePaymentInitializeOptions {
    /**
     * The CSS selector of a container where the payment widget should be inserted into.
     */
    containerId?: string;

    threeDSecure?: BraintreeThreeDSecureOptions;

    /**
     * @alpha
     * Please note that this option is currently in an early stage of
     * development. Therefore the API is unstable and not ready for public
     * consumption.
     */
    form?: BraintreeFormOptions;

    /**
     * The location to insert the Pay Later Messages.
     */
    bannerContainerId?: string;

    /**
     * A callback right before render Smart Payment Button that gets called when
     * Smart Payment Button is eligible. This callback can be used to hide the standard submit button.
     */
    onRenderButton?(): void;

    /**
     * A callback for submitting payment form that gets called
     * when buyer approved PayPal account.
     */
    submitForm?(): void;

    /**
     * A callback that gets called if unable to submit payment.
     *
     * @param error - The error object describing the failure.
     */
    onPaymentError?(error: BraintreeError | StandardError): void;

    /**
     * A callback for displaying error popup. This callback requires error object as parameter.
     */
    onError?(error: unknown): void;

    /**
     * A list of card brands that are not supported by the merchant.
     *
     * List of supported brands by braintree can be found here: https://braintree.github.io/braintree-web/current/module-braintree-web_hosted-fields.html#~field
     * search for `supportedCardBrands` property.
     *
     * List of credit cards brands:
     * 'visa',
     * 'mastercard',
     * 'american-express',
     * 'diners-club',
     * 'discover',
     * 'jcb',
     * 'union-pay',
     * 'maestro',
     * 'elo',
     * 'mir',
     * 'hiper',
     * 'hipercard'
     *
     * */
    unsupportedCardBrands?: string[];
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
    addFrame(
        error: Error | undefined,
        iframe: HTMLIFrameElement,
        cancel: () => Promise<BraintreeVerifyPayload> | undefined,
    ): void;

    /**
     * A callback that gets called when the iframe is about to be removed from
     * the current page.
     */
    removeFrame(): void;
    challengeRequested?: boolean;
    additionalInformation?: {
        acsWindowSize?: '01' | '02' | '03' | '04' | '05';
    };
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
    accessibilityLabel?: string;
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

export type BraintreeFormFieldStyles = Partial<
    Pick<CSSStyleDeclaration, 'color' | 'fontFamily' | 'fontSize' | 'fontWeight'>
>;

export interface BraintreeFormFieldKeyboardEventData {
    fieldType: string;
    errors?: BraintreeFormErrorsData;
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

export enum BraintreeSupportedCardBrands {
    Visa = 'visa',
    Mastercard = 'mastercard',
    AmericanExpress = 'american-express',
    DinersClub = 'diners-club',
    Discover = 'discover',
    Jcb = 'jcb',
    UnionPay = 'union-pay',
    Maestro = 'maestro',
    Elo = 'elo',
    Mir = 'mir',
    Hiper = 'hiper',
    Hipercard = 'hipercard',
}
