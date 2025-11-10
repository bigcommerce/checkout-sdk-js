import {
    BuyNowCartRequestBody,
    HostedInstrument,
    ShippingOption,
    VaultedInstrument,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

/**
 *
 * BigCommerce Payments Funding sources
 *
 */
export type FundingType = string;
// TODO: rename BigCommercePaymentsSDKFunding to PayPalSDKFunding
export interface BigCommercePaymentsSDKFunding {
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
 * BigCommerce Payments SDK
 *
 */

export interface BigCommercePaymentsCardFieldsConfig {
    inputEvents: {
        onChange(data: BigCommercePaymentsCardFieldsState): void;
        onFocus(data: BigCommercePaymentsCardFieldsState): void;
        onBlur(data: BigCommercePaymentsCardFieldsState): void;
        onInputSubmitRequest(data: BigCommercePaymentsCardFieldsState): void;
    };
    createVaultSetupToken?: (data: BigCommercePaymentsCardFieldsState) => void;
    createOrder?: () => Promise<string>;
    style: BigCommercePaymentsHostedFieldsRenderOptions['styles'];
    onApprove(data: BigCommercePaymentsCardFieldsOnApproveData): void;
    onError(): void;
}

export interface BigCommercePaymentsCardFieldsOnApproveData {
    vaultSetupToken?: string;
    orderID: string;
    liabilityShift?: LiabilityShiftEnum;
}

export enum LiabilityShiftEnum {
    Possible = 'POSSIBLE',
    No = 'NO',
    Unknown = 'UNKNOWN',
    Yes = 'YES',
}

interface BigCommercePaymentsCardFieldsFieldData {
    isFocused: boolean;
    isEmpty: boolean;
    isValid: boolean;
    isPotentiallyValid: boolean;
}

type BigCommercePaymentsCardFieldsCard = BigCommercePaymentsHostedFieldsCard;

export interface BigCommercePaymentsCardFieldsState {
    cards: BigCommercePaymentsCardFieldsCard[];
    emittedBy: string;
    isFormValid: boolean;
    errors: string[];
    fields: {
        cardCvvField: BigCommercePaymentsCardFieldsFieldData;
        cardNumberField: BigCommercePaymentsCardFieldsFieldData;
        cardNameField?: BigCommercePaymentsCardFieldsFieldData;
        cardExpiryField: BigCommercePaymentsCardFieldsFieldData;
    };
}

export interface BigCommercePaymentsFields {
    render(container: HTMLElement | string): Promise<void>;
    clear(): void;
    removeClass(className: string): Promise<void>;
    close(): Promise<void>;
}

interface BigCommercePaymentsFieldsInitializationData {
    placeholder?: string;
}

export interface BigCommercePaymentsCardFields {
    isEligible(): boolean;
    CVVField(config?: BigCommercePaymentsFieldsInitializationData): BigCommercePaymentsFields;
    ExpiryField(config?: BigCommercePaymentsFieldsInitializationData): BigCommercePaymentsFields;
    NameField(config?: BigCommercePaymentsFieldsInitializationData): BigCommercePaymentsFields;
    NumberField(config?: BigCommercePaymentsFieldsInitializationData): BigCommercePaymentsFields;
    submit(config?: BigCommercePaymentsCardFieldsSubmitConfig): Promise<void>;
    getState(): Promise<BigCommercePaymentsCardFieldsState>;
}

export interface BigCommercePaymentsCardFieldsSubmitConfig {
    billingAddress: {
        company?: string;
        addressLine1: string;
        addressLine2?: string;
        adminArea1: string; // State
        adminArea2: string; // City
        postalCode: string;
        countryCode?: string;
    };
}

export interface PayPalSDK {
    CardFields: (
        data: BigCommercePaymentsCardFieldsConfig,
    ) => Promise<BigCommercePaymentsCardFields>;
    Googlepay: () => {
        config: () => Promise<GooglePayConfig>;
        confirmOrder: (arg0: {
            orderId: string;
            paymentMethodData: ConfirmOrderData;
        }) => Promise<{ status: string }>;
        initiatePayerAction: () => void;
    };
    FUNDING: BigCommercePaymentsSDKFunding;
    HostedFields: {
        isEligible(): boolean;
        render(
            data: BigCommercePaymentsHostedFieldsRenderOptions,
        ): Promise<BigCommercePaymentsHostedFields>;
    };
    Legal: PayPalLegal & LegalFunding;
    Buttons(options: BigCommercePaymentsButtonsOptions): BigCommercePaymentsButtons;
    PaymentFields(
        options: BigCommercePaymentsPaymentFieldsOptions,
    ): BigCommercePaymentsPaymentFields;
    Messages(options: BigCommercePaymentsMessagesOptions): BigCommercePaymentsMessages;
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

export interface BigCommercePaymentsScriptParams {
    options: {
        'client-id'?: string;
        'merchant-id'?: string;
        'buyer-country'?: string;
        'disable-funding'?: FundingType[];
        'enable-funding'?: FundingType[];
        currency?: string;
        commit?: boolean;
        intent?: BigCommercePaymentsIntent;
        components?: ComponentsScriptType;
    };
    attributes: {
        'data-client-token'?: string;
        'data-client-metadata-id'?: string;
        'data-partner-attribution-id'?: string;
        'data-user-id-token'?: string;
    };
}

export enum BigCommercePaymentsIntent {
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
    | 'connect'
    | 'card-fields'
>;

export interface BigCommercePaymentsHostWindow extends Window {
    paypal?: PayPalSDK;
}

/**
 *
 * BigCommerce Payments Initialization Data
 *
 */
export interface BigCommercePaymentsInitializationData {
    attributionId?: string;
    availableAlternativePaymentMethods: FundingType[];
    buttonStyle?: PayPalButtonStyleOptions;
    buyerCountry?: string;
    clientId: string;
    clientToken?: string;
    enabledAlternativePaymentMethods: FundingType[];
    isDeveloperModeApplicable?: boolean;
    intent?: BigCommercePaymentsIntent;
    isAcceleratedCheckoutEnabled?: boolean;
    isHostedCheckoutEnabled?: boolean;
    isPayPalCreditAvailable?: boolean;
    isVenmoEnabled?: boolean;
    isGooglePayEnabled?: boolean;
    merchantId?: string;
    orderId?: string;
    shouldRenderFields?: boolean;
    shouldRunAcceleratedCheckout?: boolean;
    paymentButtonStyles?: Record<string, PayPalButtonStyleOptions>;
    isAppSwitchEnabled?: boolean;
}

/**
 *
 * BigCommerce Payments BuyNow
 *
 */
export interface PayPalBuyNowInitializeOptions {
    getBuyNowCartRequestBody(): BuyNowCartRequestBody;
}

/**
 *
 * BigCommerce Payments Hosted Fields
 *
 */
export interface BigCommercePaymentsHostedFieldsRenderOptions {
    fields?: {
        number?: BigCommercePaymentsHostedFieldOption;
        cvv?: BigCommercePaymentsHostedFieldOption;
        expirationDate?: BigCommercePaymentsHostedFieldOption;
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

export interface BigCommercePaymentsHostedFieldOption {
    selector: string;
    placeholder?: string;
}

export interface BigCommercePaymentsHostedFields {
    submit(
        options?: BigCommercePaymentsHostedFieldsSubmitOptions,
    ): Promise<BigCommercePaymentsHostedFieldsApprove>;
    getState(): BigCommercePaymentsHostedFieldsState;
    on(eventName: string, callback: (event: BigCommercePaymentsHostedFieldsState) => void): void;
}

export interface BigCommercePaymentsHostedFieldsSubmitOptions {
    contingencies?: Array<'3D_SECURE'>;
    cardholderName?: string;
}

export interface BigCommercePaymentsHostedFieldsApprove {
    orderId: string;
    liabilityShift?: 'POSSIBLE' | 'NO' | 'UNKNOWN';
}

export interface BigCommercePaymentsHostedFieldsState {
    cards: BigCommercePaymentsHostedFieldsCard[];
    emittedBy: string;
    fields: {
        number?: BigCommercePaymentsHostedFieldsFieldData;
        expirationDate?: BigCommercePaymentsHostedFieldsFieldData;
        expirationMonth?: BigCommercePaymentsHostedFieldsFieldData;
        expirationYear?: BigCommercePaymentsHostedFieldsFieldData;
        cvv?: BigCommercePaymentsHostedFieldsFieldData;
        postalCode?: BigCommercePaymentsHostedFieldsFieldData;
    };
}

export interface BigCommercePaymentsHostedFieldsCard {
    type: string;
    niceType: string;
    code: {
        name: string;
        size: number;
    };
}

export interface BigCommercePaymentsHostedFieldsFieldData {
    container: HTMLElement;
    isFocused: boolean;
    isEmpty: boolean;
    isPotentiallyValid: boolean;
    isValid: boolean;
}

/**
 *
 * BigCommerce Payments Buttons
 *
 */
export interface BigCommercePaymentsButtons {
    render(id: string): void;
    close(): void;
    isEligible(): boolean;
    hasReturned?(): boolean;
    resume?(): void;
}

export interface BigCommercePaymentsButtonsOptions {
    experience?: string;
    style?: PayPalButtonStyleOptions;
    fundingSource: string;
    createOrder(): Promise<string>;
    onApprove(
        data: ApproveCallbackPayload,
        actions: ApproveCallbackActions,
    ): Promise<boolean | void> | void;
    onInit?(data: InitCallbackPayload, actions: InitCallbackActions): Promise<void>;
    onComplete?(data: CompleteCallbackDataPayload): Promise<void>;
    onClick?(data: ClickCallbackPayload, actions: ClickCallbackActions): Promise<void> | void;
    onError?(error: Error): void;
    onCancel?(): void;
    onShippingAddressChange?(data: ShippingAddressChangeCallbackPayload): Promise<void>;
    onShippingOptionsChange?(data: ShippingOptionChangeCallbackPayload): Promise<void>;
}

export interface ShippingOptionChangeCallbackPayload {
    orderId: string;
    selectedShippingOption: PayPalSelectedShippingOption;
}

export interface ShippingAddressChangeCallbackPayload {
    orderId: string;
    shippingAddress: PayPalAddress;
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

export interface PayPalAddress {
    city: string;
    countryCode: string;
    postalCode: string;
    state: string;
}

export interface PaypalAddressCallbackData {
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
        phone?: {
            phone_number: {
                national_number: string;
            };
        };
    };
    purchase_units: Array<{
        shipping: {
            address: PayPalOrderAddress;
            name: {
                full_name: string;
            };
        };
    }>;
}

export interface PayPalOrderAddress {
    address_line_1: string;
    address_line_2: string;
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
 * BigCommerce Payments Payment fields
 *
 */
export interface BigCommercePaymentsPaymentFields {
    render(id: string): void;
}

export interface BigCommercePaymentsPaymentFieldsOptions {
    style?: BigCommercePaymentsFieldsStyleOptions;
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

export interface BigCommercePaymentsFieldsStyleOptions {
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
 * BigCommercePayments Messages
 */
// TODO: This interface can be removed once the PayPaySDK interface is removed
export interface BigCommercePaymentsMessages {
    render(id: string): void;
}

// TODO: This interface can be removed once the PayPaySDK interface is removed
export interface BigCommercePaymentsMessagesOptions {
    amount: number;
    placement: string;
    style?: BigCommercePaymentsMessagesStyleOptions;
    fundingSource?: string;
}

// TODO: This interface can be removed once the PayPaySDK interface is removed
export interface BigCommercePaymentsMessagesStyleOptions {
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
    setupToken?: string;
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
    setupToken?: boolean;
    fastlaneToken?: string;
    methodId?: string;
    gatewayId?: string;
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

export interface PayPalCreateOrderCardFieldsResponse {
    orderId: string;
    setupToken?: string;
}

export interface RedirectError {
    body: {
        additional_action_required: {
            data: {
                redirect_url: string;
            };
        };
    };
}
