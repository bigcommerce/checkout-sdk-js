import {
    BuyNowCartRequestBody,
    HostedInstrument,
    ShippingOption,
    VaultedInstrument,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

/**
 *
 * Big Commerce Funding sources
 *
 */
export type FundingType = string[];
export type EnableFundingType = FundingType | string;

export interface BigCommerceSDKFunding {
    CARD: string;
    BIGCOMMERCE: string;
    CREDIT: string;
    PAYLATER: string;
    OXXO: string;
    SEPA: string;
    VENMO: string;
}

/**
 *
 * Big Commerce SDK
 *
 */

export interface BigCommerceCardFieldsConfig {
    inputEvents: {
        onChange(data: BigCommerceCardFieldsState): void;
        onFocus(data: BigCommerceCardFieldsState): void;
        onBlur(data: BigCommerceCardFieldsState): void;
        onInputSubmitRequest(data: BigCommerceCardFieldsState): void;
    };
    createVaultSetupToken?: (data: BigCommerceCardFieldsState) => void;
    createOrder?: () => Promise<string>;
    style: BigCommerceHostedFieldsRenderOptions['styles'];
    onApprove(data: BigCommerceCardFieldsOnApproveData): void;
    onError(): void;
}

export interface BigCommerceCardFieldsOnApproveData {
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

interface BigCommerceCardFieldsFieldData {
    isFocused: boolean;
    isEmpty: boolean;
    isValid: boolean;
    isPotentiallyValid: boolean;
}

type BigCommerceCardFieldsCard = BigCommerceHostedFieldsCard;

export interface BigCommerceCardFieldsState {
    cards: BigCommerceCardFieldsCard[];
    emittedBy: string;
    isFormValid: boolean;
    errors: string[];
    fields: {
        cardCvvField: BigCommerceCardFieldsFieldData;
        cardNumberField: BigCommerceCardFieldsFieldData;
        cardNameField?: BigCommerceCardFieldsFieldData;
        cardExpiryField: BigCommerceCardFieldsFieldData;
    };
}

export interface BigCommerceFields {
    render(container: HTMLElement | string): Promise<void>;
    clear(): void;
    removeClass(className: string): Promise<void>;
    close(): Promise<void>;
}

interface BigCommerceFieldsInitializationData {
    placeholder?: string;
}

export interface BigCommerceCardFields {
    isEligible(): boolean;
    CVVField(config?: BigCommerceFieldsInitializationData): BigCommerceFields;
    ExpiryField(config?: BigCommerceFieldsInitializationData): BigCommerceFields;
    NameField(config?: BigCommerceFieldsInitializationData): BigCommerceFields;
    NumberField(config?: BigCommerceFieldsInitializationData): BigCommerceFields;
    submit(config?: BigCommerceCardFieldsSubmitConfig): Promise<void>;
    getState(): Promise<BigCommerceCardFieldsState>;
}

export interface BigCommerceCardFieldsSubmitConfig {
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

export interface BigCommerceSDK {
    CardFields: (data: BigCommerceCardFieldsConfig) => Promise<BigCommerceCardFields>;
    Googlepay: () => {
        config: () => Promise<GooglePayConfig>;
        confirmOrder: (arg0: {
            orderId: string;
            paymentMethodData: ConfirmOrderData;
        }) => Promise<{ status: string }>;
        initiatePayerAction: () => void;
    };
    FUNDING: BigCommerceSDKFunding;
    HostedFields: {
        isEligible(): boolean;
        render(data: BigCommerceHostedFieldsRenderOptions): Promise<BigCommerceHostedFields>;
    };
    Legal: BigCommerceLegal & LegalFunding;
    Buttons(options: BigCommerceButtonsOptions): BigCommerceButtons;
    PaymentFields(options: BigCommercePaymentFieldsOptions): BigCommercePaymentFields;
    Messages(options: BigCommerceMessagesOptions): BigCommerceMessages;
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

export type BigCommerceLegal = (params: { fundingSource: string }) => {
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

export interface BigCommerceScriptParams {
    options: {
        'client-id'?: string;
        'merchant-id'?: string;
        'buyer-country'?: string;
        'disable-funding'?: FundingType;
        'enable-funding'?: EnableFundingType;
        currency?: string;
        commit?: boolean;
        intent?: BigCommerceIntent;
        components?: ComponentsScriptType;
    };
    attributes: {
        'data-client-token'?: string;
        'data-client-metadata-id'?: string;
        'data-partner-attribution-id'?: string;
        'data-user-id-token'?: string;
    };
}

export enum BigCommerceIntent {
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

export interface BigCommerceHostWindow extends Window {
    bigCommerce?: BigCommerceSDK;
    bigCommerceLoadScript?: (
        options: BigCommerceScriptParams,
    ) => Promise<{ bigCommerce: BigCommerceSDK }>;
}

/**
 *
 * Big Commerce Initialization Data
 *
 */
export interface BigCommerceInitializationData {
    attributionId?: string;
    availableAlternativePaymentMethods: FundingType;
    buttonStyle?: BigCommerceButtonStyleOptions;
    buyerCountry?: string;
    clientId: string;
    clientToken?: string;
    enabledAlternativePaymentMethods: FundingType;
    isDeveloperModeApplicable?: boolean;
    intent?: BigCommerceIntent;
    isAcceleratedCheckoutEnabled?: boolean;
    isHostedCheckoutEnabled?: boolean;
    isBigCommerceCreditAvailable?: boolean;
    isVenmoEnabled?: boolean;
    isGooglePayEnabled?: boolean;
    merchantId?: string;
    orderId?: string;
    shouldRenderFields?: boolean;
    shouldRunAcceleratedCheckout?: boolean;
    paymentButtonStyles?: Record<string, BigCommerceButtonStyleOptions>;
}

/**
 *
 * Big Commerce BuyNow
 *
 */
export interface BigCommerceBuyNowInitializeOptions {
    getBuyNowCartRequestBody(): BuyNowCartRequestBody;
}

/**
 *
 * Big Commerce Hosted Fields
 *
 */
export interface BigCommerceHostedFieldsRenderOptions {
    fields?: {
        number?: BigCommerceHostedFieldOption;
        cvv?: BigCommerceHostedFieldOption;
        expirationDate?: BigCommerceHostedFieldOption;
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

export interface BigCommerceHostedFieldOption {
    selector: string;
    placeholder?: string;
}

export interface BigCommerceHostedFields {
    submit(options?: BigCommerceHostedFieldsSubmitOptions): Promise<BigCommerceHostedFieldsApprove>;
    getState(): BigCommerceHostedFieldsState;
    on(eventName: string, callback: (event: BigCommerceHostedFieldsState) => void): void;
}

export interface BigCommerceHostedFieldsSubmitOptions {
    contingencies?: Array<'3D_SECURE'>;
    cardholderName?: string;
}

export interface BigCommerceHostedFieldsApprove {
    orderId: string;
    liabilityShift?: 'POSSIBLE' | 'NO' | 'UNKNOWN';
}

export interface BigCommerceHostedFieldsState {
    cards: BigCommerceHostedFieldsCard[];
    emittedBy: string;
    fields: {
        number?: BigCommerceHostedFieldsFieldData;
        expirationDate?: BigCommerceHostedFieldsFieldData;
        expirationMonth?: BigCommerceHostedFieldsFieldData;
        expirationYear?: BigCommerceHostedFieldsFieldData;
        cvv?: BigCommerceHostedFieldsFieldData;
        postalCode?: BigCommerceHostedFieldsFieldData;
    };
}

export interface BigCommerceHostedFieldsCard {
    type: string;
    niceType: string;
    code: {
        name: string;
        size: number;
    };
}

export interface BigCommerceHostedFieldsFieldData {
    container: HTMLElement;
    isFocused: boolean;
    isEmpty: boolean;
    isPotentiallyValid: boolean;
    isValid: boolean;
}

/**
 *
 * Big Commerce Buttons
 *
 */
export interface BigCommerceButtons {
    render(id: string): void;
    close(): void;
    isEligible(): boolean;
}

export interface BigCommerceButtonsOptions {
    experience?: string;
    style?: BigCommerceButtonStyleOptions;
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
    selectedShippingOption: BigCommerceSelectedShippingOption;
}

export interface ShippingAddressChangeCallbackPayload {
    orderId: string;
    shippingAddress: BigCommerceAddress;
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

export interface BigCommerceAddress {
    city: string;
    countryCode: string;
    postalCode: string;
    state: string;
}

export interface BigCommerceAddressCallbackData {
    city: string;
    country_code: string;
    postal_code: string;
    state: string;
}

export interface BigCommerceSelectedShippingOption {
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
        get: () => Promise<BigCommerceOrderDetails>;
    };
}

export interface BigCommerceOrderDetails {
    payer: {
        name: {
            given_name: string;
            surname: string;
        };
        email_address: string;
        address: BigCommerceOrderAddress;
        phone?: {
            phone_number: {
                national_number: string;
            };
        };
    };
    purchase_units: Array<{
        shipping: {
            address: BigCommerceOrderAddress;
            name: {
                full_name: string;
            };
        };
    }>;
}

export interface BigCommerceOrderAddress {
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
    Big = 'Big',
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

export interface BigCommerceButtonStyleOptions {
    color?: StyleButtonColor;
    shape?: StyleButtonShape;
    height?: number;
    label?: StyleButtonLabel;
}

/**
 *
 * Big Commerce Payment fields
 *
 */
export interface BigCommercePaymentFields {
    render(id: string): void;
}

export interface BigCommercePaymentFieldsOptions {
    style?: BigCommerceFieldsStyleOptions;
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

export interface BigCommerceFieldsStyleOptions {
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
 * BigCommerce Messages
 */
// TODO: This interface can be removed once the PayPaySDK interface is removed
export interface BigCommerceMessages {
    render(id: string): void;
}

// TODO: This interface can be removed once the PayPaySDK interface is removed
export interface BigCommerceMessagesOptions {
    amount: number;
    placement: string;
    style?: BigCommerceMessagesStyleOptions;
    fundingSource?: string;
}

// TODO: This interface can be removed once the PayPaySDK interface is removed
export interface BigCommerceMessagesStyleOptions {
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

export interface BigCommerceOrderData {
    orderId: string;
    setupToken?: string;
    approveUrl: string;
}

export interface BigCommerceUpdateOrderRequestBody {
    availableShippingOptions?: ShippingOption[];
    cartId: string;
    selectedShippingOption?: ShippingOption;
}

export interface BigCommerceUpdateOrderResponse {
    statusCode: number;
}

export interface BigCommerceCreateOrderRequestBody extends HostedInstrument, VaultedInstrument {
    cartId: string;
    metadataId?: string;
    setupToken?: boolean;
}

export enum BigCommerceOrderStatus {
    Approved = 'APPROVED',
    Created = 'CREATED',
    PayerActionRequired = 'PAYER_ACTION_REQUIRED',
    PollingStop = 'POLLING_STOP',
    PollingError = 'POLLING_ERROR',
}

export interface BigCommerceOrderStatusData {
    status: BigCommerceOrderStatus;
}

export interface BigCommerceCreateOrderCardFieldsResponse {
    orderId: string;
    setupToken?: string;
}
