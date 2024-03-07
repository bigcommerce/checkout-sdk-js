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
    buttonStyle?: PayPalButtonStyleOptions;
    buyerCountry?: string;
    clientId: string;
    clientToken?: string;
    connectClientToken?: string; // TODO: remove when PPCP Fastlane A/B test will be finished
    enabledAlternativePaymentMethods: FundingType;
    isDeveloperModeApplicable?: boolean;
    intent?: PayPalCommerceIntent;
    isAcceleratedCheckoutEnabled?: boolean; // PayPal Fastlane related
    isFastlaneEnabled?: boolean; // TODO: remove this line when fastlane experiment will be rolled out to 100%
    isHostedCheckoutEnabled?: boolean;
    isPayPalCommerceAnalyticsV2Enabled?: boolean; // PayPal Fastlane related
    isPayPalCreditAvailable?: boolean;
    isVenmoEnabled?: boolean;
    isGooglePayEnabled?: boolean;
    merchantId?: string;
    orderId?: string;
    shouldRenderFields?: boolean;
    shouldRunAcceleratedCheckout?: boolean; // TODO: remove when PPCP Fastlane A/B test will be finished
    paymentButtonStyles?: Record<string, PayPalButtonStyleOptions>;
}

/**
 *
 * PayPalCommerceHostWindow contains different
 * PayPal Sdk instances for different purposes
 *
 */
export interface PayPalCommerceHostWindow extends Window {
    paypalAxo?: PayPalAxoSdk; // TODO: remove when PPCP Fastlane experiment will be rolled out to 100%
    paypalConnect?: PayPalCommerceConnect; // TODO: remove when PPCP Fastlane experiment will be rolled out to 100%
    paypalFastlane?: PayPalFastlane;
    paypalFastlaneSdk?: PayPalFastlaneSdk;
    paypalMessages?: PayPalMessagesSdk;
    paypalButtonsSdk?: PayPalButtonsSdk;
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

// TODO: remove 'connect' when PPCP Fastlane experiment will be rolled out to 100%
export type PayPalSdkComponents = Array<'connect' | 'fastlane' | 'messages'>;

/**
 *
 * PayPal Sdk instances
 *
 */
export interface PayPalAxoSdk {
    Connect(options?: PayPalCommerceConnectOptions): Promise<PayPalCommerceConnect>;
}

export interface PayPalFastlaneSdk {
    Fastlane(options?: PayPalFastlaneOptions): Promise<PayPalFastlane>;
}

export interface PayPalMessagesSdk {
    Messages(options: MessagingOptions): MessagingRender;
}

export interface PayPalButtonsSdk {
    Buttons(options: PayPalCommerceButtonsOptions): PayPalCommerceButtonMethods;
}


/**
 *
 * PayPal Messages related types
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
 * PayPal Buttons related types
 *
 */
export interface PayPalCommerceButtonMethods {
    render(id: string): void;
    close(): void;
    isEligible(): boolean;
}

export interface PayPalCommerceButtonsOptions {
    style?: PayPalButtonStyleOptions;
    fundingSource?: string;
    createOrder?(): Promise<string>;
    onApprove?(
        data: ApproveCallbackPayload,
        actions: ApproveCallbackActions,
    ): Promise<boolean | void> | void;
    onInit?(data: InitCallbackPayload, actions: InitCallbackActions): Promise<void>;
    onComplete?(data: CompleteCallbackDataPayload): Promise<void>;
    onClick?(data: ClickCallbackPayload, actions: ClickCallbackActions): Promise<void> | void;
    onError?(error: Error): void;
    onCancel?(): void;
    onShippingChange?(data: ShippingChangeCallbackPayload): Promise<void>;
}

export interface ClickCallbackPayload {
    fundingSource: string;
}

export interface ClickCallbackActions {
    reject(): void;
    resolve(): void;
}

export interface InitCallbackPayload {
    correlationID: string;
}

export interface InitCallbackActions {
    disable(): void;
    enable(): void;
}

export interface ShippingChangeCallbackPayload {
    orderID: string;
    shipping_address: PayPalShippingAddress;
    selected_shipping_option: PayPalSelectedShippingOption;
}

export interface PayPalShippingAddress {
    city: string;
    country_code: string;
    postal_code: string;
    state: string;
}

export interface PayPalSelectedShippingOption {
    amount: {
        currency_code: string;
        value: string;
    };
    id: string;
    label: string;
    selected: boolean;
    type: string;
}

export interface ApproveCallbackPayload {
    orderID?: string;
}

export interface ApproveCallbackActions {
    order: {
        get: () => Promise<PayPalOrderDetails>;
    };
}

export interface PayPalOrderDetails {
    payer: {
        name: {
            given_name: string;
            surname: string;
        };
        email_address: string;
        address: PayPalOrderAddress;
    };
    purchase_units: Array<{
        shipping: {
            address: PayPalOrderAddress;
        };
    }>;
}

export interface PayPalOrderAddress {
    address_line_1: string;
    admin_area_2: string;
    admin_area_1?: string;
    postal_code: string;
    country_code: string;
}

export interface CompleteCallbackDataPayload {
    intent: string;
    orderID: string;
}

export enum PayPalButtonStyleColor {
    gold = 'gold',
    blue = 'blue',
    silver = 'silver',
    black = 'black',
    white = 'white',
}

export enum PayPalButtonStyleLabel {
    paypal = 'paypal',
    checkout = 'checkout',
    buynow = 'buynow',
    pay = 'pay',
    installment = 'installment',
}

export enum PayPalButtonStyleShape {
    pill = 'pill',
    rect = 'rect',
}

export interface PayPalButtonStyleOptions {
    color?: PayPalButtonStyleColor;
    height?: number;
    label?: PayPalButtonStyleLabel;
    shape?: PayPalButtonStyleShape;
}

/**
 *
 * PayPal Connect related types
 * TODO: remove all PayPal Connect related types when PPCP Fastlane experiment will be rolled out to 100%
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
    CANCELED = 'cancelled',
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

/**
 *
 * PayPal Fastlane related types
 *
 */
export interface PayPalFastlane {
    identity: PayPalFastlaneIdentity;
    events: PayPalFastlaneEvents;
    profile: PayPalFastlaneProfile;
    FastlaneCardComponent(
        options: PayPalFastlaneCardComponentOptions,
    ): PayPalFastlaneCardComponentMethods;
}

export interface PayPalFastlaneOptions {
    styles?: PayPalFastlaneStylesOption;
}

export interface PayPalFastlaneIdentity {
    lookupCustomerByEmail(email: string): Promise<PayPalFastlaneLookupCustomerByEmailResult>;
    triggerAuthenticationFlow(
        customerContextId: string,
    ): Promise<PayPalFastlaneAuthenticationResult>;
}

export interface PayPalFastlaneLookupCustomerByEmailResult {
    customerContextId?: string;
}

export interface PayPalFastlaneAuthenticationResult {
    authenticationState?: PayPalFastlaneAuthenticationState;
    profileData?: PayPalFastlaneProfileData;
}

export enum PayPalFastlaneAuthenticationState {
    SUCCEEDED = 'succeeded',
    FAILED = 'failed',
    CANCELED = 'cancelled',
    UNRECOGNIZED = 'unrecognized',
}

export interface PayPalFastlaneProfileData {
    name: PayPalFastlaneProfileName;
    shippingAddress: PayPalFastlaneShippingAddress;
    card: PayPalFastlaneProfileCard;
}

export interface PayPalFastlaneProfileName {
    fullName: string;
    firstName?: string;
    lastName?: string;
}

export interface PayPalFastlaneProfilePhone {
    countryCode: string;
    nationalNumber: string;
}

export interface PayPalFastlaneShippingAddress {
    name: PayPalFastlaneProfileName;
    phoneNumber: PayPalFastlaneProfilePhone;
    address: PayPalFastlaneAddress;
}

export interface PayPalFastlaneProfileCard {
    id: string; // nonce / token
    paymentSource: PayPalFastlanePaymentSource;
}

export interface PayPalFastlanePaymentSource {
    card: PayPalFastlaneCardSource;
}

export interface PayPalFastlaneCardSource {
    brand: string;
    expiry: string; // "YYYY-MM"
    lastDigits: string; // "1111"
    name: string;
    billingAddress: PayPalFastlaneAddress;
}

export interface PayPalFastlaneAddress {
    company?: string;
    addressLine1: string;
    addressLine2?: string;
    adminArea1: string; // State
    adminArea2: string; // City
    postalCode: string;
    countryCode?: string;
}

export interface PayPalFastlaneProfileToBcCustomerDataMappingResult {
    authenticationState:
        | PayPalCommerceConnectAuthenticationState
        | PayPalFastlaneAuthenticationState;
    addresses: CustomerAddress[];
    billingAddress?: CustomerAddress;
    shippingAddress?: CustomerAddress;
    instruments: CardInstrument[];
}

export interface PayPalFastlaneStylesOption {
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

export interface PayPalFastlaneProfile {
    showCardSelector(): Promise<PayPalFastlaneCardSelectorResponse>;
}

export interface PayPalFastlaneCardSelectorResponse {
    selectionChanged: boolean;
    selectedCard: PayPalFastlaneProfileCard;
}

export interface PayPalFastlaneCardComponentMethods {
    tokenize(options: PayPalFastlaneTokenizeOptions): Promise<PayPalFastlaneTokenizeResult>;
    render(element: string): void;
}

export interface PayPalFastlaneCardComponentOptions {
    fields?: PayPalFastlaneCardComponentFields;
}

export interface PayPalFastlaneCardComponentFields {
    [key: string]: PayPalFastlaneCardComponentField;
}
export interface PayPalFastlaneCardComponentField {
    placeholder?: string;
    prefill?: string;
}

export interface PayPalFastlaneTokenizeResult {
    nonce: string;
    details: PayPalFastlaneTokenizeDetails;
    description: string;
    type: string;
}

export interface PayPalFastlaneTokenizeDetails {
    bin: string;
    cardType: string;
    expirationMoth: string;
    expirationYear: string;
    cardholderName: string;
    lastFour: string;
    lastTwo: string;
}

export interface PayPalFastlaneTokenizeOptions {
    name?: PayPalFastlaneProfileName;
    billingAddress?: PayPalFastlaneAddress;
    shippingAddress?: PayPalFastlaneAddress;
}

export interface PayPalFastlaneEvents {
    apmSelected: (options: PayPalFastlaneApmSelectedEventOptions) => void;
    emailSubmitted: (options: PayPalFastlaneEmailEnteredEventOptions) => void;
    orderPlaced: (options: PayPalFastlaneOrderPlacedEventOptions) => void;
}

export interface PayPalFastlaneEventCommonOptions {
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

export interface PayPalFastlaneApmSelectedEventOptions extends PayPalFastlaneEventCommonOptions {
    apm_shown: '0' | '1'; // alternate payment shown on the checkout page
    apm_list: string; // list of alternate payment shown on checkout page
    apm_selected: string; // alternate payment method selected / methodId
    apm_location: 'pre-email section' | 'payment section'; // placement of APM, whether it be above the email entry or in the radio buttons
}

export interface PayPalFastlaneEmailEnteredEventOptions extends PayPalFastlaneEventCommonOptions {
    user_email_saved: boolean; // shows whether checkout was loaded with or without a saved email
    apm_shown: '0' | '1'; // alternate payment shown on the checkout page
    apm_list: string; // list of alternate payment shown on checkout page 'applepay,googlepay,paypal'
}

export interface PayPalFastlaneOrderPlacedEventOptions extends PayPalFastlaneEventCommonOptions {
    selected_payment_method: string;
    currency_code: string;
}

export interface PayPalFastlanePaymentFormattedPayload {
    paypal_connect_token?: {
        order_id?: string;
        token: string;
    };
    paypal_fastlane_token?: {
        order_id?: string;
        token: string;
    };
}
