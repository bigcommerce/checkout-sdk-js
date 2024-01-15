import {
    AddressRequestBody,
    CardInstrument,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

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
    enabledAlternativePaymentMethods: FundingType;
    isDeveloperModeApplicable?: boolean;
    intent?: PayPalCommerceIntent;
    isAcceleratedCheckoutEnabled?: boolean;
    isHostedCheckoutEnabled?: boolean;
    isPayPalCreditAvailable?: boolean;
    isVenmoEnabled?: boolean;
    isGooglePayEnabled?: boolean;
    merchantId?: string;
    orderId?: string;
    shouldRenderFields?: boolean;
    shouldRunAcceleratedCheckout?: boolean;
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

export type PayPalSdkComponents = Array<'connect'>;

/**
 *
 * PayPal Sdk instances
 *
 */
export interface PayPalAxoSdk {
    Connect(): Promise<PayPalCommerceConnect>;
}

/**
 *
 * PayPal Axo related types
 *
 */
export interface PayPalCommerceConnect {
    identity: PayPalCommerceConnectIdentity;
    profile: PayPalCommerceConnectProfile;
    ConnectCardComponent(
        options: PayPalCommerceConnectCardComponentOptions,
    ): PayPalCommerceConnectCardComponentMethods;
}

export interface PayPalCommerceConnectIdentity {
    lookupCustomerByEmail(email: string): Promise<PayPalCommerceConnectLookupCustomerByEmailResult>;
    triggerAuthenticationFlow(
        customerContextId: string,
        options?: PayPalCommerceConnectAuthenticationOptions,
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

export interface PayPalCommerceConnectShippingAddress {
    name: PayPalCommerceConnectProfileName;
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
    billingAddress: PayPalCommerceConnectLegacyProfileAddress; // TODO: update to PayPalCommerceConnectAddress in next release
}

export interface PayPalCommerceConnectAddress {
    company?: string;
    addressLine1: string;
    addressLine2?: string;
    adminArea1: string; // State
    adminArea2: string; // City
    postalCode: string;
    countryCode?: string;
    phone: string;
}

// TODO: should be removed after PP next release
export interface PayPalCommerceConnectLegacyProfileAddress {
    firstName?: string;
    lastName?: string;
    company?: string;
    streetAddress: string;
    extendedAddress?: string;
    locality: string;
    region: string;
    postalCode: string;
    countryCodeNumeric?: number;
    countryCodeAlpha2?: string;
    countryCodeAlpha3?: string;
}

export interface PayPalConnectProfileToBcCustomerDataMappingResult {
    authenticationState: PayPalCommerceConnectAuthenticationState;
    addresses: AddressRequestBody[];
    billingAddress?: AddressRequestBody;
    shippingAddress?: AddressRequestBody;
    instruments: CardInstrument[];
}

export interface PayPalCommerceConnectAuthenticationOptions {
    styles?: PayPalCommerceConnectStylesOption;
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
