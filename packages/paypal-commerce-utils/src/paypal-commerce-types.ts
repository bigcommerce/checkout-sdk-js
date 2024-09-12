import { CardInstrument, CustomerAddress } from '@bigcommerce/checkout-sdk/payment-integration-api';

/**
 *
 * PayPal Commerce Funding sources
 *
 */
export type FundingType = string[];
export type EnableFundingType = FundingType | string;

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
    fastlaneStyles?: FastlaneStylesSettings;
    connectClientToken?: string; // TODO: remove when PPCP Fastlane A/B test will be finished
    enabledAlternativePaymentMethods: FundingType;
    isDeveloperModeApplicable?: boolean;
    intent?: PayPalCommerceIntent;
    isAcceleratedCheckoutEnabled?: boolean; // PayPal Fastlane related
    isFastlaneStylingEnabled?: boolean;
    isHostedCheckoutEnabled?: boolean;
    isPayPalCommerceAnalyticsV2Enabled?: boolean; // PayPal Fastlane related
    isPayPalCreditAvailable?: boolean;
    isVenmoEnabled?: boolean;
    isGooglePayEnabled?: boolean;
    merchantId?: string;
    orderId?: string;
    shouldRenderFields?: boolean;
    shouldRunAcceleratedCheckout?: boolean; // TODO: remove when PPCP Fastlane A/B test will be finished
    // paymentButtonStyles?: Record<string, PayPalButtonStyleOptions>; // TODO: PayPalButtonStyleOptions interface will be moved in the future
}

/**
 *
 * PayPalCommerceHostWindow contains different
 * PayPal Sdk instances for different purposes
 *
 */
export interface PayPalCommerceHostWindow extends Window {
    paypalFastlane?: PayPalFastlane;
    paypalFastlaneSdk?: PayPalFastlaneSdk;
    paypalMessages?: PayPalMessagesSdk;
    paypalApms?: PayPalApmSdk;
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
        'enable-funding'?: EnableFundingType;
        'disable-funding'?: FundingType;
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
        'data-client-token'?: string;
    };
}

export enum PayPalCommerceIntent {
    AUTHORIZE = 'authorize',
    CAPTURE = 'capture',
}

export type PayPalSdkComponents = Array<'fastlane' | 'messages' | 'buttons' | 'payment-fields'>;

/**
 *
 * PayPal Sdk instances
 *
 */
export interface PayPalFastlaneSdk {
    Fastlane(options?: PayPalFastlaneOptions): Promise<PayPalFastlane>;
}

export interface PayPalMessagesSdk {
    Messages(options: MessagingOptions): MessagingRender;
}

export interface PayPalApmSdk {
    Buttons(options: PayPalCommerceButtonsOptions): PayPalCommerceButtons;
    PaymentFields(options: PayPalCommercePaymentFieldsOptions): PayPalCommercePaymentFields;
}

/**
 *
 * PayPal Commerce Buttons
 *
 */
export interface PayPalCommerceButtons {
    render(id: string): void;
    close(): void;
    isEligible(): boolean;
}

export interface PayPalCommerceButtonsOptions {
    style?: PayPalButtonStyleOptions;
    fundingSource: string;
    createOrder(): Promise<string>;
    onApprove(
        data: PayPalButtonApproveCallbackPayload,
        actions: PayPalButtonApproveCallbackActions,
    ): Promise<boolean | void> | void;
    onInit?(
        data: PayPalButtonInitCallbackPayload,
        actions: PayPalButtonInitCallbackActions,
    ): Promise<void>;
    onClick?(
        data: PayPalButtonClickCallbackPayload,
        actions: PayPalButtonClickCallbackActions,
    ): Promise<void> | void;
    onError?(error: Error): void;
    onCancel?(): void;
}

export interface PayPalButtonClickCallbackPayload {
    fundingSource: string;
}

export interface PayPalButtonClickCallbackActions {
    reject(): void;
    resolve(): void;
}

export interface PayPalButtonInitCallbackPayload {
    correlationID: string;
}

export interface PayPalButtonInitCallbackActions {
    disable(): void;
    enable(): void;
}

export interface PayPalButtonApproveCallbackPayload {
    orderID?: string;
}

export interface PayPalButtonApproveCallbackActions {
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

export enum StyleButtonLabel {
    paypal = 'paypal',
    checkout = 'checkout',
    buynow = 'buynow',
    pay = 'pay',
    installment = 'installment',
}

export enum StyleButtonColor {
    gold = 'gold',
    blue = 'blue',
    silver = 'silver',
    black = 'black',
    white = 'white',
}

export enum StyleButtonShape {
    pill = 'pill',
    rect = 'rect',
}

export interface PayPalButtonStyleOptions {
    color?: StyleButtonColor;
    shape?: StyleButtonShape;
    height?: number;
    label?: StyleButtonLabel;
}

/**
 *
 * PayPal Commerce Payment fields
 *
 */
export interface PayPalCommercePaymentFields {
    render(id: string): void;
}

export interface PayPalCommercePaymentFieldsOptions {
    style?: PayPalCommerceFieldsStyleOptions;
    fundingSource: string;
    fields: {
        name?: {
            value?: string;
        };
        email?: {
            value?: string;
        };
    };
}

export interface PayPalCommerceFieldsStyleOptions {
    variables?: {
        fontFamily?: string;
        fontSizeBase?: string;
        fontSizeSm?: string;
        fontSizeM?: string;
        fontSizeLg?: string;
        textColor?: string;
        colorTextPlaceholder?: string;
        colorBackground?: string;
        colorInfo?: string;
        colorDanger?: string;
        borderRadius?: string;
        borderColor?: string;
        borderWidth?: string;
        borderFocusColor?: string;
        spacingUnit?: string;
    };
    rules?: {
        [key: string]: any;
    };
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
 * PayPal Fastlane related types
 *
 */
export interface PayPalFastlane {
    identity: PayPalFastlaneIdentity;
    events: PayPalFastlaneEvents;
    profile: PayPalFastlaneProfile;
    FastlaneCardComponent(
        options: PayPalFastlaneCardComponentOptions,
    ): Promise<PayPalFastlaneCardComponentMethods>;
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
    authenticationState: PayPalFastlaneAuthenticationState;
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
        fontSizeBase?: string;
        padding?: string;
        primaryColor?: string;
    };
    input?: {
        borderRadius?: string;
        borderColor?: string;
        focusBorderColor?: string;
        backgroundColor?: string;
        borderWidth?: string;
        textColorBase?: string;
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
    showShippingAddressSelector(): Promise<PayPalFastlaneShippingAddressSelectorResponse>;
}

export interface PayPalFastlaneShippingAddressSelectorResponse {
    selectionChanged: boolean;
    selectedAddress: PayPalFastlaneShippingAddress;
}

export interface PayPalFastlaneCardSelectorResponse {
    selectionChanged: boolean;
    selectedCard: PayPalFastlaneProfileCard;
}

export interface PayPalFastlaneCardComponentMethods {
    getPaymentToken(
        options: PayPalFastlaneGetPaymentTokenOptions,
    ): Promise<PayPalFastlaneProfileCard>;
    render(element: string): void;
}

export interface PayPalFastlaneGetPaymentTokenOptions {
    name?: PayPalFastlaneProfileName;
    billingAddress?: PayPalFastlaneAddress;
}

export interface PayPalFastlaneCardComponentOptions {
    fields?: PayPalFastlaneCardComponentFields;
}

export interface PayPalFastlaneCardComponentFields {
    cardholderName?: {
        enabled?: boolean;
        prefill?: string;
    };
    phoneNumber?: {
        placeholder?: string;
        prefill?: string;
    };
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

export interface FastlaneStylesSettings {
    fastlaneRootSettingsBackgroundColor?: string;
    fastlaneRootSettingsErrorColor?: string;
    fastlaneRootSettingsFontFamily?: string;
    fastlaneRootSettingsPadding?: string;
    fastlaneRootSettingsPrimaryColor?: string;
    fastlaneRootSettingsFontSize?: string;
    fastlaneInputSettingsBackgroundColor?: string;
    fastlaneInputSettingsBorderRadius?: string;
    fastlaneInputSettingsBorderWidth?: string;
    fastlaneInputSettingsTextColorBase?: string;
    fastlaneInputSettingsBorderColor?: string;
    fastlaneInputSettingsFocusBorderBase?: string;
    fastlaneToggleSettingsColorPrimary?: string;
    fastlaneToggleSettingsColorSecondary?: string;
    fastlaneTextBodySettingsColor?: string;
    fastlaneTextBodySettingsFontSize?: string;
    fastlaneTextCaptionSettingsFontSize?: string;
    fastlaneTextCaptionSettingsColor?: string;
    fastlaneBrandingSettings?: string;
}
