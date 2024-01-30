import { CardInstrument, CustomerAddress } from '@bigcommerce/checkout-sdk/payment-integration-api';

/**
 *
 * PayPal Commerce Funding sources
 *
 */
export type FundingType = string[];

/**
 *
 * PayPal Commerce Initialization Data
 *
 */
export interface PayPalCommerceInitializationData {
    attributionId?: string;
    availableAlternativePaymentMethods: FundingType;
    // buttonStyle?: PayPalButtonStyleOptions; // TODO: PayPalButtonStyleOptions interface will be moved in the future
    buyerCountry?: string;
    clientId: string;
    clientToken?: string;
    connectClientToken?: string;
    enabledAlternativePaymentMethods: FundingType;
    isDeveloperModeApplicable?: boolean;
    intent?: PayPalCommerceIntent;
    isAcceleratedCheckoutEnabled?: boolean; // PayPal Connect related
    isHostedCheckoutEnabled?: boolean;
    isPayPalCommerceAnalyticsV2Enabled?: boolean; // PayPal Connect related
    isPayPalCreditAvailable?: boolean;
    isVenmoEnabled?: boolean;
    isGooglePayEnabled?: boolean;
    merchantId?: string;
    orderId?: string;
    shouldRenderFields?: boolean;
    shouldRunAcceleratedCheckout?: boolean; // PayPal Connect related
    // paymentButtonStyles?: Record<string, PayPalButtonStyleOptions>; // TODO: PayPalButtonStyleOptions interface will be moved in the future
}

/**
 *
 * PayPalCommerceHostWindow contains different
 * PayPal Sdk instances for different purposes
 *
 */
export interface PayPalCommerceHostWindow extends Window {
    paypalAxo?: PayPalAxoSdk;
    paypalConnect?: PayPalCommerceConnect;
    paypalMessages?: PayPalMessagesSdk;
}

/**
 *
 * PayPal SDK config
 *
 */
export interface PayPalSdkConfig {
    options: {
        'client-id'?: string;
        'merchant-id'?: string;
        'buyer-country'?: string;
        currency?: string;
        commit?: boolean;
        intent?: PayPalCommerceIntent;
        components?: PayPalSdkComponents;
    };
    attributes: {
        'data-client-metadata-id'?: string;
        'data-partner-attribution-id'?: string;
        'data-user-id-token'?: string;
        'data-namespace'?: string;
    };
}

export enum PayPalCommerceIntent {
    AUTHORIZE = 'authorize',
    CAPTURE = 'capture',
}

export type PayPalSdkComponents = Array<'connect' | 'messages'>;

/**
 *
 * PayPal Sdk instances
 *
 */
export interface PayPalAxoSdk {
    Connect(options?: PayPalCommerceConnectOptions): Promise<PayPalCommerceConnect>;
}

export interface PayPalMessagesSdk {
    Messages(options: MessagingOptions): MessagingRender;
}

/**
 *
 * PayLater Messages related types
 *
 */
export interface MessagingRender {
    render(container: string): void;
}

export interface MessagesStyleOptions {
    layout?: 'text' | 'flex';
    logo?: {
        type: 'none' | 'inline' | 'primary';
    };
}

export interface MessagingOptions {
    amount: number;
    placement: string;
    style?: MessagesStyleOptions;
}

/**
 *
 * PayPal Axo related types
 *
 */
export interface PayPalCommerceConnect {
    identity: PayPalCommerceConnectIdentity;
    events: PayPalCommerceConnectEvents;
    profile: PayPalCommerceConnectProfile;
    ConnectCardComponent(
        options: PayPalCommerceConnectCardComponentOptions,
    ): PayPalCommerceConnectCardComponentMethods;
}

export interface PayPalCommerceConnectOptions {
    styles?: PayPalCommerceConnectStylesOption;
}

export interface PayPalCommerceConnectIdentity {
    lookupCustomerByEmail(email: string): Promise<PayPalCommerceConnectLookupCustomerByEmailResult>;
    triggerAuthenticationFlow(
        customerContextId: string,
    ): Promise<PayPalCommerceConnectAuthenticationResult>;
}

export interface PayPalCommerceConnectLookupCustomerByEmailResult {
    customerContextId?: string;
}

export interface PayPalCommerceConnectAuthenticationResult {
    authenticationState?: PayPalCommerceConnectAuthenticationState;
    profileData?: PayPalCommerceConnectProfileData;
}

export enum PayPalCommerceConnectAuthenticationState {
    SUCCEEDED = 'succeeded',
    FAILED = 'failed',
    CANCELED = 'canceled',
    UNRECOGNIZED = 'unrecognized',
}

export interface PayPalCommerceConnectProfileData {
    name: PayPalCommerceConnectProfileName;
    shippingAddress: PayPalCommerceConnectShippingAddress;
    card: PayPalCommerceConnectProfileCard;
}

export interface PayPalCommerceConnectProfileName {
    fullName: string;
    firstName: string;
    lastName: string;
}

export interface PayPalCommerceConnectProfilePhone {
    countryCode: string;
    nationalNumber: string;
}

export interface PayPalCommerceConnectShippingAddress {
    name: PayPalCommerceConnectProfileName;
    phoneNumber: PayPalCommerceConnectProfilePhone;
    address: PayPalCommerceConnectAddress;
}

export interface PayPalCommerceConnectProfileCard {
    id: string; // nonce / token
    paymentSource: PayPalCommerceConnectPaymentSource;
}

export interface PayPalCommerceConnectPaymentSource {
    card: PayPalCommerceConnectCardSource;
}

export interface PayPalCommerceConnectCardSource {
    brand: string;
    expiry: string; // "YYYY-MM"
    lastDigits: string; // "1111"
    name: string;
    billingAddress: PayPalCommerceConnectAddress;
}

export interface PayPalCommerceConnectAddress {
    company?: string;
    addressLine1: string;
    addressLine2?: string;
    adminArea1: string; // State
    adminArea2: string; // City
    postalCode: string;
    countryCode?: string;
}

export interface PayPalConnectProfileToBcCustomerDataMappingResult {
    authenticationState: PayPalCommerceConnectAuthenticationState;
    addresses: CustomerAddress[];
    billingAddress?: CustomerAddress;
    shippingAddress?: CustomerAddress;
    instruments: CardInstrument[];
}

export interface PayPalCommerceConnectStylesOption {
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

export interface PayPalCommerceConnectProfile {
    showCardSelector(): Promise<PayPalCommerceCardSelectorResponse>;
}

export interface PayPalCommerceCardSelectorResponse {
    selectionChanged: boolean;
    selectedCard: PayPalCommerceConnectProfileCard;
}

export interface PayPalCommerceConnectCardComponentMethods {
    tokenize(
        options: PayPalCommerceConnectTokenizeOptions,
    ): Promise<PayPalCommerceConnectTokenizeResult>;
    render(element: string): void;
}

export interface PayPalCommerceConnectCardComponentOptions {
    fields?: PayPalCommerceConnectCardComponentFields;
}

export interface PayPalCommerceConnectCardComponentFields {
    [key: string]: PayPalCommerceConnectCardComponentField;
}
export interface PayPalCommerceConnectCardComponentField {
    placeholder?: string;
    prefill?: string;
}

export interface PayPalCommerceConnectTokenizeResult {
    nonce: string;
    details: PayPalCommerceConnectTokenizeDetails;
    description: string;
    type: string;
}

export interface PayPalCommerceConnectTokenizeDetails {
    bin: string;
    cardType: string;
    expirationMoth: string;
    expirationYear: string;
    cardholderName: string;
    lastFour: string;
    lastTwo: string;
}

export interface PayPalCommerceConnectTokenizeOptions {
    billingAddress?: PayPalCommerceConnectAddress;
    shippingAddress?: PayPalCommerceConnectAddress;
}

export interface PayPalCommerceConnectEvents {
    apmSelected: (options: PayPalCommerceConnectApmSelectedEventOptions) => void;
    emailSubmitted: (options: PayPalCommerceConnectEmailEnteredEventOptions) => void;
    orderPlaced: (options: PayPalCommerceConnectOrderPlacedEventOptions) => void;
}

export interface PayPalCommerceConnectEventCommonOptions {
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

export interface PayPalCommerceConnectApmSelectedEventOptions
    extends PayPalCommerceConnectEventCommonOptions {
    apm_shown: '0' | '1'; // alternate payment shown on the checkout page
    apm_list: string; // list of alternate payment shown on checkout page
    apm_selected: string; // alternate payment method selected / methodId
    apm_location: 'pre-email section' | 'payment section'; // placement of APM, whether it be above the email entry or in the radio buttons
}

export interface PayPalCommerceConnectEmailEnteredEventOptions
    extends PayPalCommerceConnectEventCommonOptions {
    user_email_saved: boolean; // shows whether checkout was loaded with or without a saved email
    apm_shown: '0' | '1'; // alternate payment shown on the checkout page
    apm_list: string; // list of alternate payment shown on checkout page 'applepay,googlepay,paypal'
}

export interface PayPalCommerceConnectOrderPlacedEventOptions
    extends PayPalCommerceConnectEventCommonOptions {
    selected_payment_method: string;
    currency_code: string;
}
