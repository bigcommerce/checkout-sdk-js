import { Omit } from '@bigcommerce/checkout-sdk/payment-integration-api';

import {
    PaypalAuthorizeData,
    PaypalButtonOptions,
    PaypalButtonRender,
    PaypalSDK,
    PaypalStyleOptions,
} from './paypal';
import {
    BRAINTREE_SDK_ALPHA_VERSION,
    BRAINTREE_SDK_FASTLANE_COMPATIBLE_VERSION,
    BRAINTREE_SDK_STABLE_VERSION,
} from './sdk-verison';
import {
    BraintreeClient,
    BraintreeClientCreator,
    BraintreeDataCollectorCreator,
    BraintreeError,
    BraintreeHostedFieldsTokenizePayload,
    BraintreeModule,
    BraintreeModuleCreator,
    BraintreeModuleCreatorConfig,
    BraintreeTokenizationDetails,
    BraintreeUsBankAccountCreator,
    BraintreeWindow,
    VisaCheckoutSDK,
} from './types';
import {
    VisaCheckoutInitOptions,
    VisaCheckoutPaymentSuccessPayload,
    VisaCheckoutTokenizedPayload,
} from './visacheckout';

/**
 *
 * Constants
 *
 */
export enum BraintreeEnv {
    Sandbox = 'sandbox',
    Production = 'production',
}

/**
 *
 * Common
 *
 */
export interface BraintreeIntegrityValues {
    [BRAINTREE_SDK_STABLE_VERSION]?: string;
    [BRAINTREE_SDK_ALPHA_VERSION]?: string;
    [BRAINTREE_SDK_FASTLANE_COMPATIBLE_VERSION]?: string;
}

export enum BraintreeModuleName {
    Client = 'client',
    Connect = 'connect',
    DataCollector = 'dataCollector',
    Fastlane = 'fastlane',
    GooglePayment = 'googlePayment',
    HostedFields = 'hostedFields',
    LocalPayment = 'localPayment',
    Paypal = 'paypal',
    PaypalCheckout = 'paypalCheckout',
    ThreeDSecure = 'threeDSecure',
    UsBankAccount = 'usBankAccount',
    Venmo = 'venmo',
    VisaCheckout = 'visaCheckout',
}

export type BraintreeModuleCreators =
    | BraintreeClientCreator
    | BraintreeConnectCreator
    | BraintreeFastlaneCreator
    | BraintreeDataCollectorCreator
    | GooglePayCreator
    | BraintreeHostedFieldsCreator
    | BraintreePaypalCreator
    | BraintreePaypalCheckoutCreator
    | BraintreeThreeDSecureCreator
    | BraintreeVenmoCheckoutCreator
    | BraintreeVisaCheckoutCreator
    | BraintreeUsBankAccountCreator
    | BraintreeLocalPaymentCreator;

export interface BraintreeSDK {
    [BraintreeModuleName.Client]?: BraintreeClientCreator;
    [BraintreeModuleName.Connect]?: BraintreeConnectCreator;
    [BraintreeModuleName.Fastlane]?: BraintreeFastlaneCreator;
    [BraintreeModuleName.DataCollector]?: BraintreeDataCollectorCreator;
    [BraintreeModuleName.GooglePayment]?: GooglePayCreator;
    [BraintreeModuleName.HostedFields]?: BraintreeHostedFieldsCreator;
    [BraintreeModuleName.Paypal]?: BraintreePaypalCreator;
    [BraintreeModuleName.PaypalCheckout]?: BraintreePaypalCheckoutCreator;
    [BraintreeModuleName.ThreeDSecure]?: BraintreeThreeDSecureCreator;
    [BraintreeModuleName.Venmo]?: BraintreeVenmoCheckoutCreator;
    [BraintreeModuleName.VisaCheckout]?: BraintreeVisaCheckoutCreator;
    [BraintreeModuleName.UsBankAccount]?: BraintreeUsBankAccountCreator;
    [BraintreeModuleName.LocalPayment]?: BraintreeLocalPaymentCreator;
}

export type BraintreeLocalPaymentCreator = BraintreeModuleCreator<
    LocalPaymentInstance,
    BraintreeLocalPaymentCreateConfig
>;

export interface BraintreeLocalPaymentCreateConfig extends BraintreeModuleCreatorConfig {
    merchantAccountId: string;
}

export interface BraintreeInitializationData {
    intent?: 'authorize' | 'order' | 'sale';
    isCreditEnabled?: boolean;
    isAcceleratedCheckoutEnabled?: boolean;
    isFastlaneEnabled?: boolean;
    isBraintreeAnalyticsV2Enabled?: boolean;
    shouldRunAcceleratedCheckout?: boolean; // TODO: only for BT AXO A/B testing purposes, hence should be removed after testing
    paymentButtonStyles?: Record<string, PaypalStyleOptions>;
}

export interface BraintreePaypalRequest {
    amount: string | number;
    billingAgreementDescription?: string;
    currency?: string;
    displayName?: string;
    enableShippingAddress: true;
    flow: 'checkout' | 'vault';
    intent?: 'authorize' | 'order' | 'sale';
    landingPageType?: 'login' | 'billing';
    locale?: string;
    offerCredit?: boolean;
    shippingAddressEditable?: boolean;
    shippingAddressOverride?: BraintreeShippingAddressOverride;
    useraction?: 'commit';
}

export interface BraintreeShippingAddressOverride {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    countryCode: string;
    phone?: string;
    recipientName?: string;
}

export interface BraintreeTokenizePayload {
    nonce: string;
    type: 'PaypalAccount' | 'VenmoAccount';
    details: BraintreeTokenizationDetails;
    creditFinancingOffered?: {
        totalCost: {
            value: string;
            currency: string;
        };
        term: number;
        monthlyPayment: {
            value: string;
            currency: string;
        };
        totalInsterest: {
            value: string;
            currency: string;
        };
        payerAcceptance: boolean;
        cartAmountImmutable: boolean;
    };
}

export interface BraintreeVerifyPayload {
    nonce: string;
    details: {
        cardType: string;
        lastFour: string;
        lastTwo: string;
    };
    description: string;
    liabilityShiftPossible: boolean;
    liabilityShifted: boolean;
}

export type BraintreeFormErrorData = Omit<BraintreeFormFieldState, 'isFocused'>;

export type BraintreeFormErrorDataKeys =
    | 'number'
    | 'expirationDate'
    | 'expirationMonth'
    | 'expirationYear'
    | 'cvv'
    | 'postalCode';

export type BraintreeFormErrorsData = Partial<
    Record<BraintreeFormErrorDataKeys, BraintreeFormErrorData>
>;

/**
 *
 * Braintree Google Pay
 *
 */
export interface BraintreeGooglePayThreeDSecure {
    verifyCard(options: BraintreeGooglePayThreeDSecureOptions): Promise<BraintreeVerifyPayload>;
}

export interface BraintreeGooglePayThreeDSecureOptions {
    nonce: string;
    amount: number;
    bin: string;
    showLoader?: boolean;
    onLookupComplete(data: BraintreeThreeDSecureVerificationData, next: () => void): void;
}

/**
 *
 * Braintree Hosted Fields
 *
 */
export type BraintreeHostedFieldsCreator = BraintreeModuleCreator<
    BraintreeHostedFields,
    BraintreeHostedFieldsCreatorConfig
>;

export interface BraintreeHostedFields {
    getState(): BraintreeHostedFieldsState;
    teardown(): Promise<void>;
    tokenize(
        options?: BraintreeHostedFieldsTokenizeOptions,
    ): Promise<BraintreeHostedFieldsTokenizePayload>;
    on(eventName: string, callback: (event: BraintreeHostedFieldsState) => void): void;
}

export interface BraintreeHostedFieldsCreatorConfig extends BraintreeModuleCreatorConfig {
    fields: {
        number?: BraintreeHostedFieldOption;
        expirationDate?: BraintreeHostedFieldOption;
        expirationMonth?: BraintreeHostedFieldOption;
        expirationYear?: BraintreeHostedFieldOption;
        cvv?: BraintreeHostedFieldOption;
        postalCode?: BraintreeHostedFieldOption;
        cardholderName?: BraintreeHostedFieldOption;
    };
    styles?: {
        input?: { [key: string]: string };
        '.invalid'?: { [key: string]: string };
        '.valid'?: { [key: string]: string };
        ':focus'?: { [key: string]: string };
    };
}

export interface BraintreeHostedFieldOption {
    container: string | HTMLElement;
    placeholder?: string;
    type?: string;
    formatInput?: boolean;
    maskInput?: boolean | { character?: string; showLastFour?: string };
    select?: boolean | { options?: string[] };
    maxCardLength?: number;
    maxlength?: number;
    minlength?: number;
    prefill?: string;
    rejectUnsupportedCards?: boolean;
    supportedCardBrands?: { [key: string]: boolean };
}

export interface BraintreeHostedFieldsState {
    cards: BraintreeHostedFieldsCard[];
    emittedBy: string;
    fields: {
        number?: BraintreeHostedFieldsFieldData;
        expirationDate?: BraintreeHostedFieldsFieldData;
        expirationMonth?: BraintreeHostedFieldsFieldData;
        expirationYear?: BraintreeHostedFieldsFieldData;
        cvv?: BraintreeHostedFieldsFieldData;
        postalCode?: BraintreeHostedFieldsFieldData;
    };
}

export interface BraintreeHostedFieldsCard {
    type: string;
    niceType: string;
    code: { name: string; size: number };
}

export interface BraintreeHostedFieldsFieldData {
    container: HTMLElement;
    isFocused: boolean;
    isEmpty: boolean;
    isPotentiallyValid: boolean;
    isValid: boolean;
}

export interface BraintreeHostedFieldsTokenizeOptions {
    vault?: boolean;
    fieldsToTokenize?: string[];
    cardholderName?: string;
    billingAddress?: BraintreeBillingAddressRequestData;
}

export interface BraintreeBillingAddressRequestData {
    postalCode?: string;
    firstName?: string;
    lastName?: string;
    company?: string;
    streetAddress?: string;
    extendedAddress?: string;
    locality?: string;
    region?: string;
    countryCodeNumeric?: string;
    countryCodeAlpha2?: string;
    countryCodeAlpha3?: string;
    countryName?: string;
}

export interface BraintreeHostedFormError extends BraintreeError {
    details?: {
        invalidFieldKeys?: string[];
    };
}

export interface BraintreeFormFieldState {
    isFocused: boolean;
    isEmpty: boolean;
    isPotentiallyValid: boolean;
    isValid: boolean;
}

export interface TokenizationPayload {
    nonce: string;
    bin: string;
}

/**
 *
 * Braintree 3D Secure
 *
 */
export type BraintreeThreeDSecureCreator = BraintreeModuleCreator<
    BraintreeThreeDSecure,
    BraintreeThreeDSecureCreatorConfig
>;

export interface BraintreeThreeDSecure extends BraintreeModule {
    verifyCard(options: BraintreeThreeDSecureOptions): Promise<BraintreeVerifyPayload>;
    cancelVerifyCard(): Promise<BraintreeVerifyPayload>;
}

export interface BraintreeThreeDSecureCreatorConfig extends BraintreeModuleCreatorConfig {
    version?: number;
}

export interface BraintreeThreeDSecureOptions {
    nonce: string;
    amount: number;
    challengeRequested?: boolean;
    showLoader?: boolean;
    bin?: string;
    additionalInformation?: {
        acsWindowSize?: '01' | '02' | '03' | '04' | '05';
    };
    addFrame?(
        error: Error | undefined,
        iframe: HTMLIFrameElement,
        cancel: () => Promise<BraintreeVerifyPayload> | undefined,
    ): void;
    removeFrame?(): void;
    onLookupComplete(data: BraintreeThreeDSecureVerificationData, next: () => void): void;
}

interface BraintreeThreeDSecureVerificationData {
    lookup: {
        threeDSecureVersion: string;
    };
    paymentMethod: BraintreeVerifyPayload;
    requiresUserAuthentication: boolean;
    threeDSecureInfo: {
        liabilityShiftPossible: boolean;
        liabilityShifted: boolean;
    };
}

/**
 *
 * Braintree PayPal
 *
 */
export type BraintreePaypalCreator = BraintreeModuleCreator<BraintreePaypal>;

export interface BraintreePaypal {
    closeWindow(): void;
    focusWindow(): void;
    tokenize(options: BraintreePaypalRequest): Promise<BraintreeTokenizePayload>;
    Buttons?(options: PaypalButtonOptions): PaypalButtonRender;
}

/**
 * A set of options that are required to support 3D Secure authentication flow.
 *
 * If the customer uses a credit card that has 3D Secure enabled, they will be
 * asked to verify their identity when they pay. The verification is done
 * through a web page via an iframe provided by the card issuer.
 */
// export interface BraintreeThreeDSecureOptions {
//     /**
//      * A callback that gets called when the iframe is ready to be added to the
//      * current page. It is responsible for determining where the iframe should
//      * be inserted in the DOM.
//      *
//      * @param error - Any error raised during the verification process;
//      * undefined if there is none.
//      * @param iframe - The iframe element containing the verification web page
//      * provided by the card issuer.
//      * @param cancel - A function, when called, will cancel the verification
//      * process and remove the iframe.
//      */
//     addFrame(
//         error: Error | undefined,
//         iframe: HTMLIFrameElement,
//         cancel: () => Promise<BraintreeVerifyPayload> | undefined,
//     ): void;
//
//     /**
//      * A callback that gets called when the iframe is about to be removed from
//      * the current page.
//      */
//     removeFrame(): void;
// }

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

/**
 *
 * Braintree PayPal Checkout
 *
 */
export type BraintreePaypalCheckoutCreator = BraintreeModuleCreator<BraintreePaypalCheckout>;

export interface BraintreePaypalCheckout {
    loadPayPalSDK(
        config: BraintreePaypalSdkCreatorConfig,
        callback: (instance: BraintreePaypalCheckout) => void,
    ): void;
    createPayment(options: BraintreePaypalRequest): Promise<string>;
    teardown(): Promise<void>;
    tokenizePayment(options: PaypalAuthorizeData): Promise<BraintreeTokenizePayload>;
}

export interface BraintreePaypalSdkCreatorConfig {
    components?: string;
    currency?: string;
    intent?: string;
    isCreditEnabled?: boolean;
    commit?: boolean;
}

/**
 *
 * Braintree Venmo
 *
 */
export type BraintreeVenmoCheckoutCreator = BraintreeModuleCreator<
    BraintreeVenmoCheckout,
    BraintreeVenmoCreatorConfig
>;

export interface BraintreeVenmoCheckout extends BraintreeModule {
    tokenize(callback: (error: BraintreeError, payload: BraintreeTokenizePayload) => void): void;
    isBrowserSupported(): boolean;
}

export interface BraintreeVenmoCreatorConfig extends BraintreeModuleCreatorConfig {
    allowDesktop: boolean;
    paymentMethodUsage: string;
}

/**
 *
 * Braintree Visa Checkout
 *
 */
export type BraintreeVisaCheckoutCreator = BraintreeModuleCreator<BraintreeVisaCheckout>;

export interface BraintreeVisaCheckout extends BraintreeModule {
    tokenize(payment: VisaCheckoutPaymentSuccessPayload): Promise<VisaCheckoutTokenizedPayload>;
    createInitOptions(options: Partial<VisaCheckoutInitOptions>): VisaCheckoutInitOptions;
}

/**
 *
 * Braintree Connect
 *
 */
export type BraintreeConnectCreator = BraintreeModuleCreator<
    BraintreeConnect,
    BraintreeConnectConfig
>;

export interface BraintreeConnectConfig {
    authorization: string;
    client: BraintreeClient;
    deviceData?: string;
    styles?: BraintreeConnectStylesOption;
}

export interface BraintreeConnect {
    profile: BraintreeConnectProfile;
    identity: BraintreeConnectIdentity;
    ConnectCardComponent: (
        options: BraintreeConnectCardComponentOptions,
    ) => BraintreeConnectCardComponent;
    events: BraintreeFastlaneEvents;
}

export interface BraintreeConnectProfile {
    showCardSelector(): Promise<BraintreeFastlaneCardSelectorResponse>;
}

export interface BraintreeConnectWindow extends Window {
    braintreeConnect: BraintreeConnect;
}

export interface BraintreeConnectIdentity {
    lookupCustomerByEmail(email: string): Promise<BraintreeConnectLookupCustomerByEmailResult>;
    triggerAuthenticationFlow(
        customerId: string,
        options?: BraintreeConnectAuthenticationOptions,
    ): Promise<BraintreeConnectAuthenticationCustomerResult>;
}

export interface BraintreeConnectLookupCustomerByEmailResult {
    customerContextId?: string;
}

export interface BraintreeConnectAuthenticationOptions {
    styles?: BraintreeConnectStylesOption;
    fetchFullProfileData?: boolean; // default: true
}

export interface BraintreeConnectStylesOption {
    root?: {
        backgroundColorPrimary?: string;
        errorColor?: string;
        fontFamily?: string;
    };
    input?: {
        borderRadius?: string;
        borderColor?: string;
        focusBorderColor?: string;
    };
    toggle?: {
        colorPrimary?: string;
        colorSecondary?: string;
    };
    text?: {
        body?: {
            color?: string;
            fontSize?: string;
        };
        caption?: {
            color?: string;
            fontSize?: string;
        };
    };
    branding?: string; // 'light' | 'dark'
}

export interface BraintreeConnectAuthenticationCustomerResult {
    authenticationState: BraintreeFastlaneAuthenticationState;
    profileData: BraintreeConnectProfileData;
}

export interface BraintreeConnectProfileData {
    connectCustomerAuthAssertionToken: string;
    connectCustomerId: string;
    addresses: BraintreeConnectAddress[];
    cards: BraintreeConnectVaultedInstrument[];
    phones: BraintreeConnectPhone[];
    name: BraintreeConnectName;
}

export interface BraintreeConnectName {
    given_name: string;
    surname: string;
}

export interface BraintreeConnectAddress {
    id?: string;
    firstName?: string;
    lastName?: string;
    company?: string;
    streetAddress: string;
    extendedAddress?: string;
    locality: string;
    region: string;
    postalCode: string;
    countryCodeNumeric?: number;
    countryCodeAlpha2: string;
    countryCodeAlpha3?: string;
    phoneNumber?: string;
}

export interface BraintreeConnectCardPaymentSource {
    brand: string;
    expiry: string;
    lastDigits: string;
    name?: string;
    billingAddress: BraintreeConnectAddress;
}

export interface BraintreeConnectPaymentSource {
    card: BraintreeConnectCardPaymentSource;
}

export interface BraintreeConnectVaultedInstrument {
    id: string; // This is the nonce / token
    paymentSource: BraintreeConnectPaymentSource;
}

export interface BraintreeConnectCardComponentOptions {
    fields: BraintreeConnectCardComponentFields;
}

export interface BraintreeConnectCardComponentFields {
    [key: string]: BraintreeConnectCardComponentField;
}
export interface BraintreeConnectCardComponentField {
    placeholder?: string;
    prefill?: string;
}

export interface BraintreeConnectPhone {
    country_code: string;
    national_number: string;
}

export interface BraintreeConnectTokenizeResult {
    nonce: string;
    details: BraintreeConnectTokenizeDetails;
    description: string;
    type: string;
}

export interface BraintreeConnectTokenizeDetails {
    bin: string;
    cardType: string;
    expirationMoth: string;
    expirationYear: string;
    cardholderName: string;
    lastFour: string;
    lastTwo: string;
}

export interface BraintreeConnectTokenizeOptions {
    billingAddress?: BraintreeConnectAddress;
    shippingAddress?: BraintreeConnectAddress;
}

export interface Card {
    type: string;
    niceType: string;
    code: {
        name: 'CVV' | 'CID' | 'CVC';
        size: number;
    };
}

export interface BraintreeConnectCardComponent {
    (options: BraintreeConnectCardComponentOptions): BraintreeConnectCardComponent;
    tokenize(options: BraintreeConnectTokenizeOptions): Promise<BraintreeConnectTokenizeResult>;
    getPaymentToken(
        options: BraintreeFastlaneTokenizeOptions,
    ): Promise<BraintreeFastlaneVaultedInstrument>; // FIXME: this method does not support by Connect
    render(element: string): void;
}

/**
 *  Braintree Fastlane
 */
export type BraintreeFastlaneCreator = BraintreeModuleCreator<
    BraintreeFastlane,
    BraintreeFastlaneConfig
>;

export interface BraintreeFastlaneConfig {
    authorization: string;
    client: BraintreeClient;
    deviceData?: string;
    styles?: BraintreeFastlaneStylesOption;
}

export interface BraintreeFastlane {
    identity: BraintreeFastlaneIdentity;
    profile: BraintreeFastlaneProfile;
    FastlaneCardComponent: (
        options: BraintreeFastlaneCardComponentOptions,
    ) => Promise<BraintreeFastlaneCardComponent>;
    events: BraintreeFastlaneEvents;
}

export interface BraintreeFastlaneProfile {
    showCardSelector(): Promise<BraintreeFastlaneCardSelectorResponse>;
    showShippingAddressSelector(): Promise<BraintreeFastlaneShippingAddressSelectorResponse>;
}

export interface BraintreeFastlaneShippingAddressSelectorResponse {
    selectionChanged: boolean;
    selectedAddress: BraintreeFastlaneShippingAddress;
}

export interface BraintreeFastlaneShippingAddress {
    name: BraintreeFastlaneProfileName;
    phoneNumber: string;
    id?: string;
    firstName?: string;
    lastName?: string;
    company?: string;
    streetAddress: string;
    extendedAddress?: string;
    locality: string;
    region: string;
    postalCode: string;
    countryCodeNumeric?: number;
    countryCodeAlpha2: string;
    countryCodeAlpha3?: string;
}

export interface BraintreeFastlaneProfileName {
    fullName: string;
    firstName?: string;
    lastName?: string;
}

export interface BraintreeFastlaneCardSelectorResponse {
    selectionChanged: boolean;
    selectedCard: BraintreeFastlaneVaultedInstrument;
}

export interface BraintreeFastlaneWindow extends Window {
    braintreeFastlane: BraintreeFastlane;
}

export interface BraintreeFastlaneIdentity {
    lookupCustomerByEmail(email: string): Promise<BraintreeFastlaneLookupCustomerByEmailResult>;
    triggerAuthenticationFlow(
        customerId: string,
        options?: BraintreeFastlaneAuthenticationOptions,
    ): Promise<BraintreeFastlaneAuthenticationCustomerResult>;
}

export interface BraintreeFastlaneLookupCustomerByEmailResult {
    customerContextId?: string;
}

export interface BraintreeFastlaneAuthenticationOptions {
    styles?: BraintreeFastlaneStylesOption;
}

export interface BraintreeFastlaneStylesOption {
    root?: {
        backgroundColorPrimary?: string;
        errorColor?: string;
        fontFamily?: string;
    };
    input?: {
        borderRadius?: string;
        borderColor?: string;
        focusBorderColor?: string;
    };
    toggle?: {
        colorPrimary?: string;
        colorSecondary?: string;
    };
    text?: {
        body?: {
            color?: string;
            fontSize?: string;
        };
        caption?: {
            color?: string;
            fontSize?: string;
        };
    };
    branding?: string; // 'light' | 'dark'
}

export enum BraintreeFastlaneAuthenticationState {
    SUCCEEDED = 'succeeded',
    FAILED = 'failed',
    CANCELED = 'cancelled',
    UNRECOGNIZED = 'unrecognized',
}

export interface BraintreeFastlaneAuthenticationCustomerResult {
    authenticationState: BraintreeFastlaneAuthenticationState;
    profileData: BraintreeFastlaneProfileData;
}

export interface BraintreeFastlaneProfileData {
    fastlaneCustomerAuthAssertionToken: string;
    fastlaneCustomerId: string;
    shippingAddress: BraintreeFastlaneAddress;
    card: BraintreeFastlaneVaultedInstrument;
    name: BraintreeFastlaneName;
}

export interface BraintreeFastlaneName {
    firstName: string;
    lastName: string;
}

export interface BraintreeFastlaneAddress {
    id?: string;
    firstName?: string;
    lastName?: string;
    company?: string;
    streetAddress: string;
    extendedAddress?: string;
    locality: string;
    region: string;
    postalCode: string;
    countryCodeNumeric?: number;
    countryCodeAlpha2: string;
    countryCodeAlpha3?: string;
    phoneNumber?: string;
}

export interface BraintreeFastlaneCardPaymentSource {
    brand: string;
    expiry: string;
    lastDigits: string;
    name?: string;
    billingAddress: BraintreeFastlaneAddress;
}

export interface BraintreeFastlanePaymentSource {
    card: BraintreeFastlaneCardPaymentSource;
}

export interface BraintreeFastlaneVaultedInstrument {
    id: string; // This is the nonce / token
    paymentSource: BraintreeFastlanePaymentSource;
}

export interface BraintreeFastlaneCardComponentOptions {
    styles: BraintreeFastlaneStylesOption;
    fields: BraintreeFastlaneCardComponentFields;
}

export interface BraintreeFastlaneCardComponentFields {
    cardholderName?: {
        enabled?: boolean;
        prefill?: string;
    };
    phoneNumber?: {
        placeholder?: string;
        prefill?: string;
    };
}

export interface BraintreeFastlaneTokenizeDetails {
    bin: string;
    cardType: string;
    expirationMoth: string;
    expirationYear: string;
    cardholderName: string;
    lastFour: string;
    lastTwo: string;
}

export interface BraintreeFastlaneTokenizeOptions {
    billingAddress?: BraintreeFastlaneAddress;
    shippingAddress?: BraintreeFastlaneAddress;
}

export interface BraintreeFastlaneEvents {
    apmSelected: (options: BraintreeFastlaneApmSelectedEventOptions) => void;
    emailSubmitted: (options: BraintreeFastlaneEmailEnteredEventOptions) => void;
    orderPlaced: (options: BraintreeFastlaneOrderPlacedEventOptions) => void;
}

export interface BraintreeFastlaneEventCommonOptions {
    context_type: 'cs_id';
    context_id: string; // checkout session id
    page_type: 'checkout_page';
    page_name: string; // title of the checkout initiation page
    partner_name: 'bigc';
    user_type: 'store_member' | 'store_guest'; // type of the user on the merchant site
    store_id: string;
    merchant_name: string;
    experiment: string; // stringify JSON object "[{ treatment_group: 'test' | 'control' }]"
}

export interface BraintreeFastlaneApmSelectedEventOptions
    extends BraintreeFastlaneEventCommonOptions {
    apm_shown: '0' | '1'; // alternate payment shown on the checkout page
    apm_list: string; // list of alternate payment shown on checkout page
    apm_selected: string; // alternate payment method selected / methodId
    apm_location: 'pre-email section' | 'payment section'; // placement of APM, whether it be above the email entry or in the radio buttons
}

export interface BraintreeFastlaneEmailEnteredEventOptions
    extends BraintreeFastlaneEventCommonOptions {
    user_email_saved: boolean; // shows whether checkout was loaded with or without a saved email
    apm_shown: '0' | '1'; // alternate payment shown on the checkout page
    apm_list: string; // list of alternate payment shown on checkout page 'applepay,googlepay,paypal'
}

export interface BraintreeFastlaneOrderPlacedEventOptions
    extends BraintreeFastlaneEventCommonOptions {
    selected_payment_method: string;
    currency_code: string;
}

export interface BraintreeFastlaneCardComponent {
    (options: BraintreeFastlaneCardComponentOptions): BraintreeFastlaneCardComponent;
    tokenize(options: BraintreeConnectTokenizeOptions): Promise<BraintreeConnectTokenizeResult>; // FIXME: this method does not support by Fastlane
    getPaymentToken(
        options: BraintreeFastlaneTokenizeOptions,
    ): Promise<BraintreeFastlaneVaultedInstrument>;
    render(element: string): void;
}

/**
 *
 * Braintree Local Methods
 *
 */
export interface LocalPaymentInstanceConfig {
    paymentType: string;
    amount: number;
    fallback: {
        url: string;
        buttonText: string;
    };
    currencyCode: string;
    shippingAddressRequired: boolean;
    email: string;
    givenName: string;
    surname: string;
    address: {
        countryCode: string;
    };
    onPaymentStart(data: onPaymentStartData, start: () => Promise<void>): void;
}

export interface StartPaymentError {
    code: string;
}

export interface onPaymentStartData {
    paymentId: string;
}

export interface LocalPaymentsPayload {
    nonce: string;
}

export interface LocalPaymentInstance extends BraintreeModule {
    startPayment(
        config: LocalPaymentInstanceConfig,
        callback: (
            startPaymentError: StartPaymentError,
            payload: LocalPaymentsPayload,
        ) => Promise<void>,
    ): void;
}

export type GetLocalPaymentInstance = (localPaymentInstance: LocalPaymentInstance) => void;

/**
 *
 * Braintree GooglePay
 *
 */

type AddressFormat = 'FULL' | 'MIN';

export enum TotalPriceStatusType {
    ESTIMATED = 'ESTIMATED',
    FINAL = 'FINAL',
    NOT_CURRENTLY_KNOWN = 'NOT_CURRENTLY_KNOWN',
}

export interface GooglePayBraintreeDataRequest {
    merchantInfo: {
        authJwt?: string;
        merchantId?: string;
        merchantName?: string;
    };
    transactionInfo: {
        currencyCode: string;
        totalPriceStatus: TotalPriceStatusType;
        totalPrice: string;
    };
    cardRequirements: {
        billingAddressRequired: boolean;
        billingAddressFormat: AddressFormat;
    };
    emailRequired?: boolean;
    phoneNumberRequired?: boolean;
    shippingAddressRequired?: boolean;
}

export interface GooglePayBraintreePaymentDataRequestV1 {
    allowedPaymentMethods: string[];
    apiVersion: number;
    cardRequirements: {
        allowedCardNetworks: string[];
        billingAddressFormat: string;
        billingAddressRequired: boolean;
    };
    environment: string;
    i: {
        googleTransactionId: string;
        startTimeMs: number;
    };
    merchantInfo: {
        merchantId: string;
        merchantName: string;
        authJwt?: string;
    };
    paymentMethodTokenizationParameters: {
        parameters: {
            'braintree:apiVersion': string;
            'braintree:authorizationFingerprint': string;
            'braintree:merchantId': string;
            'braintree:metadata': string;
            'braintree:sdkVersion': string;
            gateway: string;
        };
        tokenizationType: string;
    };
    shippingAddressRequired: boolean;
    phoneNumberRequired: boolean;
    transactionInfo: {
        currencyCode: string;
        totalPrice: string;
        totalPriceStatus: TotalPriceStatusType;
    };
}

export type GooglePayCreator = BraintreeModuleCreator<GooglePayBraintreeSDK>;

export interface GooglePayBraintreeSDK extends BraintreeModule {
    createPaymentDataRequest(
        request?: GooglePayBraintreeDataRequest,
    ): GooglePayBraintreePaymentDataRequestV1;
}

/**
 *
 * Other
 *
 */
export interface BraintreeHostWindow extends BraintreeWindow {
    braintree?: BraintreeSDK;
    paypal?: PaypalSDK;
    braintreeConnect?: BraintreeConnect;
    braintreeFastlane?: BraintreeFastlane;
    V?: VisaCheckoutSDK;
}
