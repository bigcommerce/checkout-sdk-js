import { Omit } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { PaypalAuthorizeData, PaypalButtonOptions, PaypalButtonRender, PaypalSDK } from './paypal';

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
export interface BraintreeModuleCreator<
    TInstance,
    TOptions = BraintreeModuleCreatorConfig,
    TError = BraintreeError,
> {
    create(
        config: TOptions,
        callback?: (error: TError, instance: TInstance) => void,
    ): Promise<TInstance>;
}

export interface BraintreeModuleCreatorConfig {
    client?: BraintreeClient;
    authorization?: string;
}

export interface BraintreeModule {
    teardown(): Promise<void>;
}

export interface BraintreeSDK {
    client?: BraintreeClientCreator;
    connect?: BraintreeConnectCreator;
    dataCollector?: BraintreeDataCollectorCreator;
    googlePayment?: GooglePayCreator;
    hostedFields?: BraintreeHostedFieldsCreator;
    paypal?: BraintreePaypalCreator;
    paypalCheckout?: BraintreePaypalCheckoutCreator;
    threeDSecure?: BraintreeThreeDSecureCreator;
    venmo?: BraintreeVenmoCheckoutCreator;
    // visaCheckout?: BraintreeVisaCheckoutCreator; // TODO: should be added in future migration
    usBankAccount?: BraintreeBankAccountCreator;
    localPayment?: BraintreeLocalPaymentCreator;
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
    shouldRunAcceleratedCheckout?: boolean; // TODO: only for BT AXO A/B testing purposes, hence should be removed after testing
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
    details: BraintreeDetails;
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

export interface BraintreeDetails {
    username?: string;
    email?: string;
    payerId?: string;
    firstName?: string;
    lastName?: string;
    countryCode?: string;
    phone?: string;
    shippingAddress?: BraintreeShippingAddress;
    billingAddress?: BraintreeAddress;
}

export interface BraintreeAddress {
    line1: string;
    line2: string;
    city: string;
    state: string;
    postalCode: string;
    countryCode: string;
}

export interface BraintreeShippingAddress extends BraintreeAddress {
    recipientName: string;
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

export interface BraintreeError extends Error {
    type: 'CUSTOMER' | 'MERCHANT' | 'NETWORK' | 'INTERNAL' | 'UNKNOWN';
    code: string;
    details?: unknown;
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
 * Braintree Client
 *
 */
export type BraintreeClientCreator = BraintreeModuleCreator<BraintreeClient>;

export interface BraintreeClient {
    request(payload: BraintreeRequestData): Promise<BraintreeTokenizeResponse>;
    getVersion(): string | void;
}

export interface BraintreeRequestData {
    data: {
        creditCard: {
            billingAddress?: {
                countryCodeAlpha2: string;
                locality: string;
                countryName: string;
                postalCode: string;
                streetAddress: string;
            };
            cardholderName: string;
            cvv?: string;
            expirationDate: string;
            number: string;
            options: {
                validate: boolean;
            };
        };
    };
    endpoint: string;
    method: string;
}

export interface BraintreeTokenizeResponse {
    creditCards: Array<{ nonce: string }>;
}

/**
 *
 * Braintree Data Collector
 *
 */
export type BraintreeDataCollectorCreator = BraintreeModuleCreator<
    BraintreeDataCollector,
    BraintreeDataCollectorCreatorConfig
>;

export interface BraintreeDataCollectorCreatorConfig extends BraintreeModuleCreatorConfig {
    kount?: boolean;
    paypal?: boolean;
    riskCorrelationId?: string; // Info: the option is needed for PayPal Analytics
}

export interface BraintreeDataCollector extends BraintreeModule {
    deviceData?: string;
}

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

export interface BraintreeHostedFieldsTokenizePayload {
    nonce: string;
    details: {
        bin: string;
        cardType: string;
        expirationMonth: string;
        expirationYear: string;
        lastFour: string;
        lastTwo: string;
    };
    description: string;
    type: string;
    binData: {
        commercial: string;
        countryOfIssuance: string;
        debit: string;
        durbinRegulated: string;
        healthcare: string;
        issuingBank: string;
        payroll: string;
        prepaid: string;
        productId: string;
    };
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
// TODO: should be added in future migration
// export type BraintreeVisaCheckoutCreator = BraintreeModuleCreator<BraintreeVisaCheckout>;

// export interface BraintreeVisaCheckout extends BraintreeModule {
//     tokenize(payment: VisaCheckoutPaymentSuccessPayload): Promise<VisaCheckoutTokenizedPayload>;
//     createInitOptions(options: Partial<VisaCheckoutInitOptions>): VisaCheckoutInitOptions;
// }

/**
 *
 * Braintree US Bank Account
 *
 */

export interface BankAccountSuccessPayload {
    accountNumber: string;
    routingNumber: string;
    ownershipType: string;
    accountType: string;
    firstName?: string;
    lastName?: string;
    businessName?: string;
    billingAddress: {
        streetAddress: string;
        extendedAddress: string;
        locality: string;
        region: string;
        postalCode: string;
    };
}

export type BraintreeBankAccountCreator = BraintreeModuleCreator<BraintreeBankAccount>;

export interface BraintreeBankAccount extends BraintreeModule {
    tokenize(payload: {
        bankDetails: BankAccountSuccessPayload;
        mandateText: string;
    }): Promise<{ nonce: string; details: BraintreeDetails }>;
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
    identity: BraintreeConnectIdentity;
    ConnectCardComponent: (
        options: BraintreeConnectCardComponentOptions,
    ) => BraintreeConnectCardComponent;
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

export enum BraintreeConnectAuthenticationState {
    SUCCEEDED = 'succeeded',
    FAILED = 'failed',
    CANCELED = 'canceled',
    UNRECOGNIZED = 'unrecognized',
}

export interface BraintreeConnectAuthenticationCustomerResult {
    authenticationState: BraintreeConnectAuthenticationState;
    profileData: BraintreeConnectProfileData;
}

export interface BraintreeConnectProfileData {
    connectCustomerAuthAssertionToken: string;
    connectCustomerId: string;
    addresses: BraintreeConnectAddress[];
    cards: BraintreeConnectVaultedInstrument[];
    phones: BraintreeConnectPhone[];
    name: {
        given_name: string;
        surname: string;
    };
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
export interface BraintreeHostWindow extends Window {
    braintree?: BraintreeSDK;
    paypal?: PaypalSDK;
    braintreeConnect?: BraintreeConnect;
}
