export * from './braintree';
export * from './paypal';
export * from './visacheckout';

/**
 *
 * Braintree Module
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
    authorization?: string; // Info: authorization uses clientToken as a value
}

export interface BraintreeModule {
    teardown(): Promise<void>;
}

/**
 *
 * Braintree Window
 *
 */
export interface BraintreeWindow extends Window {
    client?: BraintreeClientCreator;
    braintreeFastlane?: BraintreeFastlane;
}

/**
 *
 * Braintree Client
 *
 */
export type BraintreeClientCreator = BraintreeModuleCreator<BraintreeClient>;

export interface BraintreeClient {
    request(payload: BraintreeClientRequestPayload): Promise<BraintreeClientRequestResponse>;
}

export interface BraintreeClientRequestPayload {
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

export interface BraintreeClientRequestResponse {
    creditCards: BraintreeHostedFieldsTokenizePayload[];
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
    kount?: boolean; // Info: this param is needed for fraud detection (should always be 'true')
    paypal?: boolean; // TODO: based on braintree documentation, this param is deprecated, so we dont need it anymore
    riskCorrelationId?: string; // Info: the option is needed for PayPal Analytics
}

export interface BraintreeDataCollector extends BraintreeModule {
    deviceData?: string;
}

// TODO: remove this interface when BraintreeIntegrationService will be removed
export interface BraintreeDataCollectors {
    default?: BraintreeDataCollector;
    paypal?: BraintreeDataCollector;
}

/**
 *
 * Braintree US Bank Account
 *
 */
export type BraintreeUsBankAccountCreator = BraintreeModuleCreator<BraintreeUsBankAccount>;

export interface BraintreeUsBankAccount {
    tokenize(
        options: BraintreeUsBankAccountTokenizationOptions,
    ): Promise<BraintreeUsBankAccountTokenizationResponse>;
}

export interface BraintreeUsBankAccountTokenizationOptions {
    bankDetails: BraintreeUsBankAccountDetails;
    mandateText: string;
}

export interface BraintreeUsBankAccountTokenizationResponse {
    nonce: string;
    details: BraintreeTokenizationDetails;
}

export interface BraintreeUsBankAccountDetails {
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

// TODO: move this interface in separate types group if it will be used in another (not ACH) strategies
// This seems to be an interface which will be used in different places
export interface BraintreeTokenizationDetails {
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

/**
 *
 * Braintree Fastlane
 *
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
    getPaymentToken(
        options: BraintreeFastlaneTokenizeOptions,
    ): Promise<BraintreeFastlaneVaultedInstrument>;
    render(element: string): void;
}

/**
 *
 * Braintree Errors
 *
 */
export enum BraintreeErrorType {
    Customer = 'CUSTOMER',
    Merchant = 'MERCHANT',
    Network = 'NETWORK',
    Internal = 'INTERNAL',
    Unknown = 'UNKNOWN',
}

export enum BraintreeErrorCode {
    KountNotEnabled = 'DATA_COLLECTOR_KOUNT_NOT_ENABLED',
}

export interface BraintreeError extends Error {
    type: BraintreeErrorType;
    code: string | BraintreeErrorCode.KountNotEnabled;
    details?: unknown;
}
