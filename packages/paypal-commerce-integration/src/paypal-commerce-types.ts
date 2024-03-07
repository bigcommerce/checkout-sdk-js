import {
    BuyNowCartRequestBody,
    HostedInstrument,
    ShippingOption,
    VaultedInstrument,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    PayPalCommerceButtonsOptions,
    PayPalCommerceButtonMethods,
    PayPalButtonStyleOptions,
} from '@bigcommerce/checkout-sdk/paypal-commerce-utils';

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

export interface PayPalCommerceCardFieldsConfig {
    inputEvents: {
        onChange(data: PayPalCommerceCardFieldsState): void;
        onFocus(data: PayPalCommerceCardFieldsState): void;
        onBlur(data: PayPalCommerceCardFieldsState): void;
        onInputSubmitRequest(data: PayPalCommerceCardFieldsState): void;
    };
    createVaultSetupToken?: (data: PayPalCommerceCardFieldsState) => void;
    createOrder?: () => Promise<string>;
    style: PayPalCommerceHostedFieldsRenderOptions['styles'];
    onApprove(data: PayPalCommerceCardFieldsOnApproveData): void;
    onError(): void;
}

export interface PayPalCommerceCardFieldsOnApproveData {
    vaultSetupToken?: string;
    orderID: string;
}

interface PayPalCommerceCardFieldsFieldData {
    isFocused: boolean;
    isEmpty: boolean;
    isValid: boolean;
    isPotentiallyValid: boolean;
}

type PayPalCommerceCardFieldsCard = PayPalCommerceHostedFieldsCard;

export interface PayPalCommerceCardFieldsState {
    cards: PayPalCommerceCardFieldsCard[];
    emittedBy: string;
    isFormValid: boolean;
    errors: string[];
    fields: {
        cardCvvField: PayPalCommerceCardFieldsFieldData;
        cardNumberField: PayPalCommerceCardFieldsFieldData;
        cardNameField?: PayPalCommerceCardFieldsFieldData;
        cardExpiryField: PayPalCommerceCardFieldsFieldData;
    };
}

export interface PayPalCommerceFields {
    render(container: HTMLElement | string): void;
    clear(): void;
    removeClass(className: string): Promise<void>;
    close(): Promise<void>;
}

interface PayPalCommerceFieldsInitializationData {
    placeholder?: string;
}

export interface PayPalCommerceCardFields {
    isEligible(): boolean;
    CVVField(config?: PayPalCommerceFieldsInitializationData): PayPalCommerceFields;
    ExpiryField(config?: PayPalCommerceFieldsInitializationData): PayPalCommerceFields;
    NameField(config?: PayPalCommerceFieldsInitializationData): PayPalCommerceFields;
    NumberField(config?: PayPalCommerceFieldsInitializationData): PayPalCommerceFields;
    submit(): Promise<void>;
    getState(): Promise<PayPalCommerceCardFieldsState>;
}

export interface PayPalSDK {
    CardFields: (data: PayPalCommerceCardFieldsConfig) => Promise<PayPalCommerceCardFields>;
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
    Buttons(options: PayPalCommerceButtonsOptions): PayPalCommerceButtonMethods;
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
        'data-client-metadata-id'?: string;
        'data-partner-attribution-id'?: string;
        'data-user-id-token'?: string;
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
    | 'connect'
    | 'card-fields'
>;

export interface PayPalCommerceHostWindow extends Window {
    paypal?: PayPalSDK;
    paypalLoadScript?: (options: PayPalCommerceScriptParams) => Promise<{ paypal: PayPalSDK }>;
}

/**
 *
 * PayPal Commerce Initialization Data
 *
 */
// TODO: remove this interface because it was moved to paypal-commerce-utils package
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
