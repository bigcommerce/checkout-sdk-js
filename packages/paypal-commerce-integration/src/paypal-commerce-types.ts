import {
    BuyNowCartRequestBody,
    HostedInstrument,
    ShippingOption,
    VaultedInstrument,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

/**
 *
 * PayPal Commerce Funding sources
 *
 */
export type FundingType = string[];
export type EnableFundingType = FundingType | string;

export interface PayPalCommerceSDKFunding {
    CARD: string;
    PAYPAL: string;
    CREDIT: string;
    PAYLATER: string;
    OXXO: string;
    SEPA: string;
    VENMO: string;
}

/**
 *
 * PayPal Commerce SDK
 *
 */
export interface PayPalSDK {
    Googlepay: () => {
        config: () => Promise<GooglePayConfig>;
        confirmOrder: (arg0: {
            orderId: string;
            paymentMethodData: ConfirmOrderData;
        }) => Promise<{ status: string }>;
        initiatePayerAction: () => void;
    };
    FUNDING: PayPalCommerceSDKFunding;
    HostedFields: {
        isEligible(): boolean;
        render(data: PayPalCommerceHostedFieldsRenderOptions): Promise<PayPalCommerceHostedFields>;
    };
    Legal: PayPalLegal & LegalFunding;
    Buttons(options: PayPalCommerceButtonsOptions): PayPalCommerceButtons;
    PaymentFields(options: PayPalCommercePaymentFieldsOptions): PayPalCommercePaymentFields;
    Messages(options: PayPalCommerceMessagesOptions): PayPalCommerceMessages;
}

export interface ConfirmOrderData {
    tokenizationData: {
        type: string;
        token: string;
    };
    info: {
        cardNetwork: string;
        cardDetails: string;
    };
    type: string;
}

export interface GooglePayConfig {
    allowedPaymentMethods: AllowedPaymentMethods[];
    apiVersion: number;
    apiVersionMinor: number;
    countryCode: string;
    isEligible: boolean;
    merchantInfo: {
        merchantId: string;
        merchantOrigin: string;
    };
}

export interface AllowedPaymentMethods {
    type: string;
    parameters: {
        allowedAuthMethods: string[];
        allowedCardNetworks: string[];
        billingAddressRequired: boolean;
        assuranceDetailsRequired: boolean;
        billingAddressParameters: {
            format: string;
        };
    };
    tokenizationSpecification: {
        type: string;
        parameters: {
            gateway: string;
            gatewayMerchantId: string;
        };
    };
}

export type PayPalLegal = (params: { fundingSource: string }) => {
    render(container: string): void;
};

export interface LegalFunding {
    FUNDING: {
        PAY_UPON_INVOICE: string;
    };
}

export interface BirthDate {
    getFullYear(): number;
    getDate(): number;
    getMonth(): number;
}

export interface PayPalCommerceScriptParams {
    options: {
        'client-id'?: string;
        'merchant-id'?: string;
        'buyer-country'?: string;
        'disable-funding'?: FundingType;
        'enable-funding'?: EnableFundingType;
        currency?: string;
        commit?: boolean;
        intent?: PayPalCommerceIntent;
        components?: ComponentsScriptType;
    };
    attributes: {
        'data-client-token'?: string;
        'data-partner-attribution-id'?: string;
    };
}

export enum PayPalCommerceIntent {
    AUTHORIZE = 'authorize',
    CAPTURE = 'capture',
}

export type ComponentsScriptType = Array<
    | 'buttons'
    | 'funding-eligibility'
    | 'hosted-fields'
    | 'messages'
    | 'payment-fields'
    | 'legal'
    | 'googlepay'
>;

export interface PayPalCommerceHostWindow extends Window {
    paypal?: PayPalSDK;
}

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
    enabledAlternativePaymentMethods: FundingType;
    isDeveloperModeApplicable?: boolean;
    intent?: PayPalCommerceIntent;
    isHostedCheckoutEnabled?: boolean;
    isPayPalCreditAvailable?: boolean;
    isVenmoEnabled?: boolean;
    isGooglePayEnabled?: boolean;
    merchantId?: string;
    orderId?: string;
    shouldRenderFields?: boolean;
    paymentButtonStyles?: Record<string, PayPalButtonStyleOptions>;
}

/**
 *
 * PayPal Commerce BuyNow
 *
 */
export interface PayPalBuyNowInitializeOptions {
    getBuyNowCartRequestBody(): BuyNowCartRequestBody;
}

/**
 *
 * PayPal Commerce Hosted Fields
 *
 */
export interface PayPalCommerceHostedFieldsRenderOptions {
    fields?: {
        number?: PayPalCommerceHostedFieldOption;
        cvv?: PayPalCommerceHostedFieldOption;
        expirationDate?: PayPalCommerceHostedFieldOption;
    };
    paymentsSDK?: boolean;
    styles?: {
        input?: { [key: string]: string };
        '.invalid'?: { [key: string]: string };
        '.valid'?: { [key: string]: string };
        ':focus'?: { [key: string]: string };
    };
    createOrder(): Promise<string>;
}

export interface PayPalCommerceHostedFieldOption {
    selector: string;
    placeholder?: string;
}

export interface PayPalCommerceHostedFields {
    submit(
        options?: PayPalCommerceHostedFieldsSubmitOptions,
    ): Promise<PayPalCommerceHostedFieldsApprove>;
    getState(): PayPalCommerceHostedFieldsState;
    on(eventName: string, callback: (event: PayPalCommerceHostedFieldsState) => void): void;
}

export interface PayPalCommerceHostedFieldsSubmitOptions {
    contingencies?: Array<'3D_SECURE'>;
    cardholderName?: string;
}

export interface PayPalCommerceHostedFieldsApprove {
    orderId: string;
    liabilityShift?: 'POSSIBLE' | 'NO' | 'UNKNOWN';
}

export interface PayPalCommerceHostedFieldsState {
    cards: PayPalCommerceHostedFieldsCard[];
    emittedBy: string;
    fields: {
        number?: PayPalCommerceHostedFieldsFieldData;
        expirationDate?: PayPalCommerceHostedFieldsFieldData;
        expirationMonth?: PayPalCommerceHostedFieldsFieldData;
        expirationYear?: PayPalCommerceHostedFieldsFieldData;
        cvv?: PayPalCommerceHostedFieldsFieldData;
        postalCode?: PayPalCommerceHostedFieldsFieldData;
    };
}

export interface PayPalCommerceHostedFieldsCard {
    type: string;
    niceType: string;
    code: {
        name: string;
        size: number;
    };
}

export interface PayPalCommerceHostedFieldsFieldData {
    container: HTMLElement;
    isFocused: boolean;
    isEmpty: boolean;
    isPotentiallyValid: boolean;
    isValid: boolean;
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
    experience?: string;
    style?: PayPalButtonStyleOptions;
    fundingSource: string;
    createOrder(): Promise<string>;
    onApprove(
        data: ApproveCallbackPayload,
        actions: ApproveCallbackActions,
    ): Promise<boolean | void> | void;
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

export interface ShippingChangeCallbackPayload {
    orderID: string;
    shipping_address: PayPalAddress;
    selected_shipping_option: PayPalSelectedShippingOption;
}

export interface PayPalAddress {
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
 * PayPalCommerce Messages
 *
 */
export interface PayPalCommerceMessages {
    render(id: string): void;
}

export interface PayPalCommerceMessagesOptions {
    amount: number;
    placement: string;
    style?: PayPalCommerceMessagesStyleOptions;
    fundingSource?: string;
}

export interface PayPalCommerceMessagesStyleOptions {
    layout?: string;
}

/**
 *
 * Other
 *
 */
export enum NonInstantAlternativePaymentMethods {
    OXXO = 'oxxo',
}

export interface PayPalOrderData {
    orderId: string;
    approveUrl: string;
}

export interface PayPalUpdateOrderRequestBody {
    availableShippingOptions?: ShippingOption[];
    cartId: string;
    selectedShippingOption?: ShippingOption;
}

export interface PayPalUpdateOrderResponse {
    statusCode: number;
}

export interface PayPalCreateOrderRequestBody extends HostedInstrument, VaultedInstrument {
    cartId: string;
    metadataId?: string;
}

export enum PayPalOrderStatus {
    Approved = 'APPROVED',
    Created = 'CREATED',
    PayerActionRequired = 'PAYER_ACTION_REQUIRED',
    PollingStop = 'POLLING_STOP',
    PollingError = 'POLLING_ERROR',
}

export interface PayPalOrderStatusData {
    status: PayPalOrderStatus;
}
