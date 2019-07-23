export interface AdyenComponentCallbacks {
    onChange?(state: AdyenCardState): void;
}

export interface AdyenHostWindow extends Window {
    AdyenCheckout?: new(configuration: AdyenConfiguration) => AdyenCheckout;
}

export interface AdyenConfiguration {
    /*
     * Use test, and then change this to live when you're ready to accept live payments.
     */
    environment?: string;

    /*
     * The shopper's locale. This is used to set the language rendered in the Components.
     */
    locale?: string;

    /*
     * The Origin Key of your website.
     */
    originKey: string;

    /*
     * Supported from Components version 3.0.0 and later. The full paymentMethods response,
     * returned in step 1. We recommend that you pass this on the AdyenCheckout instance.
     * Otherwise, you need to pass the specific payment method details separately for each
     * Component.
     */
    paymentMethodsResponse?: PaymentMethodsResponse;

    /*
     * Specify the function that you created, for example, handleOnChange. If you wish
     * to override this function, you can also define an onChange event on the Component
     * level.
     */
    onChange?(state: AdyenCardState, component: AdyenComponent): void;
}

export interface PaymentMethodsResponse {
    /**
     * Groups of payment methods.
     */
    groups?: AdyenPaymentMethodGroup[];

    /**
     * Detailed list of one-click payment methods.
     */
    oneClickPaymentMethods?: RecurringDetail;

    /**
     * Detailed list of payment methods required to generate payment forms.
     */
    paymentMethods?: AdyenPaymentMethod[];

    /**
     * List of all stored payment methods.
     */
    storedPaymentMethods?: AdyenStoredPaymentMethod[];
}

export interface AdyenPaymentMethod {
    /**
     * List of possible brands. For example: visa, mc.
     */
    brands?: string[];

    /**
     * The configuration of the payment method.
     */
    configuration?: object;

    /**
     * All input details to be provided to complete the payment with this payment
     * method.
     */
    details?: InputDetail[];

    /**
     * The group where this payment method belongs to.
     */
    group?: Group;

    /**
     * The displayable name of this payment method.
     */
    name?: string;

    /**
     * Echo data required to send in next calls.
     */
    paymentMethodData?: string;

    /**
     * Indicates whether this payment method supports tokenization or not.
     */
    supportsRecurring?: boolean;

    /**
     * The unique payment method code.
     */
    type?: string;
}

export interface AdyenPaymentMethodGroup {
    /**
     * The type to submit for any payment method in this group.
     */
    groupType?: string;

    /**
     * The human-readable name of this group.
     */
    name?: string;

    /**
     * The types of payment methods that belong in this group.
     */
    types?: string[];
}

export interface InputDetail {
    /**
     * Configuration parameters for the required input.
     */
    configuration?: object;

    /**
     * Input details can also be provided recursively.
     */
    details?: SubInputDetail[];

    /**
     * In case of a select, the URL from which to query the items.
     */
    itemSearchUrl?: string;

    /**
     * In case of a select, the items to choose from.
     */
    items?: Item[];

    /**
     * The value to provide in the result.
     */
    key?: string;

    /**
     * True if this input value is optional.
     */
    optional?: boolean;

    /**
     * The type of the required input.
     */
    type?: string;

    /**
     * The value can be pre-filled, if available.
     */
    value?: string;
}

export enum ThreeDS2ComponentType {
    ThreeDS2DeviceFingerprint = 'threeDS2DeviceFingerprint',
    ThreeDS2Challenge = 'threeDS2Challenge',
}

export interface ThreeDS2Result {
    payment_data: string;
    result_code: string;
    token: string;
}

export interface ThreeDS1Result {
    acs_url: string;
    payer_auth_request: string;
    callback_url: string;
    merchant_data: string;
}

export interface SubInputDetail {
    /**
     * Configuration parameters for the required input.
     */
    configuration?: object;

    /**
     * In case of a select, the items to choose from.
     */
    items?: Item[];

    /**
     * The value to provide in the result.
     */
    key?: string;

    /**
     * True if this input is optional to provide.
     */
    optional?: boolean;

    /**
     * The type of the required input.
     */
    type?: string;

    /**
     * The value can be pre-filled, if available.
     */
    value?: string;
}

export interface Item {
    /**
     * The value to provide in the result.
     */
    id?: string;

    /**
     * The display name.
     */
    name?: string;
}

export interface Group {
    /**
     * The name of the group.
     */
    name?: string;

    /**
     * Echo data to be used if the payment method is displayed as part of this group.
     */
    paymentMethodData?: string;

    /**
     * The unique code of the group.
     */
    type?: string;
}

export interface AdyenStoredPaymentMethod {
    /**
     * The brand of the card.
     */
    brand?: string;

    /**
     * The month the card expires.
     */
    expiryMonth?: string;

    /**
     * The year the card expires.
     */
    expiryYear?: string;

    /**
     * The unique payment method code.
     */
    holderName?: string;

    /**
     * A unique identifier of this stored payment method.
     */
    id?: string;

    /**
     * The last four digits of the PAN.
     */
    lastFour?: string;

    /**
     * The display name of the stored payment method.
     */
    name: string;

    /**
     * The shopper’s email address.
     */
    shopperEmail?: string;

    /**
     * The supported shopper interactions for this stored payment method.
     */
    supportedShopperInteractions?: string[];

    /**
     * The type of payment method.
     */
    type?: string;
}

export interface RecurringDetail extends AdyenPaymentMethod {
    /**
     * The reference that uniquely identifies the recurring detail.
     */
    recurringDetailReference?: string;

    /**
     * Contains information on previously stored payment details.
     */
    storedDetails?: StoredDetails;
}

export interface StoredDetails {
    /**
     * The stored bank account.
     */
    bank?: Bank;

    /**
     * The stored card information.
     */
    card?: Card;

    /**
     * The email associated with stored payment details.
     */
    emailAddress?: string;
}

export interface Bank {
    /**
     * The bank account number (without separators).
     */
    bankAccountNumber?: string;

    /**
     * The bank city.
     */
    bankCity?: string;

    /**
     * The location id of the bank. The field value is nil in most cases.
     */
    bankLocationId?: string;

    /**
     * The name of the bank.
     */
    bankName?: string;

    /**
     * The Business Identifier Code (BIC) is the SWIFT address assigned to
     * a bank. The field value is nil in most cases.
     */
    bic?: string;

    /**
     * Country code where the bank is located.
     * A valid value is an ISO two-character country code (e.g. 'NL').
     */
    countryCode?: string;

    /**
     * The International Bank Account Number (IBAN).
     */
    iban?: string;

    /**
     * The name of the bank account holder. If you submit a name with non-Latin
     * characters, we automatically replace some of them with corresponding Latin
     * characters to meet the FATF recommendations. For example:
     * χ12 is converted to ch12.
     * üA is converted to euA.
     * Peter Møller is converted to Peter Mller, because banks don't accept 'ø'.
     * After replacement, the ownerName must have at least three alphanumeric characters
     * (A-Z, a-z, 0-9), and at least one of them must be a valid Latin character
     * (A-Z, a-z). For example:
     * John17 - allowed.
     * J17 - allowed.
     * 171 - not allowed.
     * John-7 - allowed.
     */
    ownerName?: string;

    /**
     * The bank account holder's tax ID.
     */
    taxId?: string;
}

export interface Card {
    /**
     * The card verification code (1-20 characters). Depending on the card brand, it
     * is known also as:
     * CVV2/CVC2 – length: 3 digits
     * CID – length: 4 digits
     */
    cvc?: string;

    /**
     * The card expiry month. Format: 2 digits, zero-padded for single digits. For example:
     * 03 = March
     * 11 = November
     * Required
     */
    expiryMonth: string;

    /**
     * The card expiry year. Format: 4 digits. For example: 2020
     * Required
     */
    expiryYear: string;

    /**
     * The name of the cardholder, as printed on the card.
     * Required
     */
    holderName: string;

    /**
     * The issue number of the card (for some UK debit cards only).
     */
    issueNumber?: string;

    /**
     * The card number (4-19 characters). Do not use any separators. When this value is
     * returned in a response, only the last 4 digits of the card number are returned.
     * Required
     */
    number: string;

    /**
     * The month component of the start date (for some UK debit cards only).
     */
    startNumnber?: string;

    /**
     * The year component of the start date (for some UK debit cards only).
     */
    startYear?: string;
}

export interface CreditCardPlaceHolder {
    encryptedCardNumber?: string;
    encryptedExpiryDate?: string;
    encryptedSecurityCode: string;
}

export interface SepaPlaceHolder {
    ownerName?: string;
    ibanNumber?: string;
}

export interface AdyenComponent {
    mount(containerId: string): HTMLElement;
    unmount(): void;
}

export interface AdyenCheckout {
    create(type: string, componentOptions?: CreditCardComponentOptions |
        ThreeDS2DeviceFingerprintComponentOptions | ThreeDS2ChallengeComponentOptions): AdyenComponent;
}

export interface ThreeDS2ComponentOptions {
    threeDS2ChallengeWidgetSize?: string;
}

export interface CreditCardComponentOptions {
    /**
     * Set an object containing the details array for type: scheme from
     * the /paymentMethods response.
     */
    details?: InputDetail[];

    /**
     * Set to true to show the checkbox to save card details for the next payment.
     */
    enableStoreDetails?: boolean;

    /**
     * Set to true to request the name of the card holder.
     */
    hasHolderName?: boolean;

    /**
     * Set to true to require the card holder name.
     */
    holderNameRequired?: boolean;

    /**
     * Prefill the card holder name field. Supported from Card component
     */
    holderName?: string;

    /**
     * Defaults to ['mc','visa','amex']. Configure supported card types to
     * facilitate brand recognition used in the Secured Fields onBrand callback.
     * See list of available card types. If a shopper enters a card type not
     * specified in the GroupTypes configuration, the onBrand callback will not be invoked.
     */
    groupTypes?: string[];
    /**
     * Set a style object to customize the input fields. See Styling Secured Fields
     * for a list of supported properties.
     */
    styles?: AdyenStyleOptions;

    /**
     * Specify the sample values you want to appear for card detail input fields.
     */
    placeholders?: CreditCardPlaceHolder | SepaPlaceHolder;

    /**
     * Called when the shopper enters data in the card input fields.
     * Here you have the option to override your main Adyen Checkout configuration.
     */
    onChange?(state: AdyenCardState, component: AdyenComponent): void;
}

export interface AdyenCardState {
    data: AdyenCardDataPaymentMethodState;
    isValid?: boolean;
}

export interface AdyenCardDataPaymentMethodState {
    paymentMethod: AdyenCardPaymentMethodState;
}
export interface AdyenCardPaymentMethodState {
    encryptedCardNumber: string;
    encryptedExpiryMonth: string;
    encryptedExpiryYear: string;
    encryptedSecurityCode: string;
    holderName?: string;
    type: string;
}
export interface ThreeDS2DeviceFingerprintComponentOptions {
    fingerprintToken: string;
    onComplete(fingerprintData: any): void;
    onError(error: AdyenError): void;
}

export enum ResultCode {
    AuthenticationFinished = 'AuthenticationFinished',
    Authorised = 'Authorised',
    Cancelled = 'Cancelled',
    ChallengeShopper = 'ChallengeShopper',
    Error = 'Error',
    IdentifyShopper = 'IdentifyShopper',
    Pending = 'Pending',
    Received = 'Received',
    RedirectShopper = 'RedirectShopper',
    Refused = 'Refused',
}

export interface ThreeDS2ChallengeComponentOptions {
    challengeToken: string;
    size?: string;
    onComplete(fingerprintData: any): void;
    onError(error: AdyenError): void;
}

export interface AdyenStyleOptions {
    /**
     * Base styling applied to the iframe. All styling extends from this style.
     */
    base?: CssProperties;

    /**
     * Styling applied when a field fails validation.
     */
    error?: CssProperties;

    /**
     * Styling applied to the field's placeholder values.
     */
    placeholder?: CssProperties;

    /**
     * Styling applied once a field passes validation.
     */
    validated?: CssProperties;
}

export interface AdyenError {
    errorCode: string;
    message: string;
}

export interface CssProperties {
    background?: string;
    color?: string;
    display?: string;
    font?: string;
    fontFamily?: string;
    fontSize?: string;
    fontSizeAdjust?: string;
    fontSmoothing?: string;
    fontStretch?: string;
    fontStyle?: string;
    fontVariant?: string;
    fontVariantAlternates?: string;
    fontVariantCaps?: string;
    fontVariantEastAsian?: string;
    fontVariantLigatures?: string;
    fontVariantNumeric?: string;
    fontWeight?: string;
    letterSpacing?: string;
    lineHeight?: string;
    mozOsxFontSmoothing?: string;
    mozTransition?: string;
    outline?: string;
    opacity?: string | number;
    padding?: string;
    textAlign?: string;
    textShadow?: string;
    transition?: string;
    webkitFontSmoothing?: string;
    webkitTransition?: string;
}

export interface ThreeDS2OnComplete {
    data: {
        details: {
            'threeds2.challengeResult'?: string;
            'threeds2.fingerprint'?: string;
            paymentData: string;
        };
    };
}

export interface ThreeDSRequiredErrorResponse {
    errors: [
        { code: string }
    ];
    three_ds_result: {
        result_code: ResultCode;
        token?: string;
        payment_data?: string;
        acs_url?: string;
        callback_url?: string;
        payer_auth_request?: string;
        merchant_data?: string;
    };
    status: string;
}
