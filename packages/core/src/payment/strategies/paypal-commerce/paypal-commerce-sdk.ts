import { ShippingOption } from '../../../shipping';

export interface ClickDataOptions {
    fundingSource: string;
}

export interface ClickActions {
    reject(): Promise<void>;
    resolve(): Promise<void>;
}

// Moved to package
export interface OrderData {
    orderId: string;
    approveUrl: string;
}

export interface OrderStatus {
    status: 'APPROVED' | 'CREATED' | string;
}

// Moved to package
export enum StyleButtonLabel {
    paypal = 'paypal',
    checkout = 'checkout',
    buynow = 'buynow',
    pay = 'pay',
    installment = 'installment',
}

// Moved to package
export enum StyleButtonLayout {
    vertical = 'vertical',
    horizontal = 'horizontal',
}

// Moved to package
export enum StyleButtonColor {
    gold = 'gold',
    blue = 'blue',
    silver = 'silver',
    black = 'black',
    white = 'white',
}

// Moved to package
export enum StyleButtonShape {
    pill = 'pill',
    rect = 'rect',
}

// Moved to package
export interface PaypalButtonStyleOptions {
    layout?: StyleButtonLayout;
    color?: StyleButtonColor;
    shape?: StyleButtonShape;
    height?: number;
    label?: StyleButtonLabel;
    tagline?: boolean;
    custom?: {
        label?: string;
        css?: {
            background?: string;
            color?: string;
            width?: string;
        };
    };
}

// Moved to package
export interface PayPalAddress {
    city: string;
    country_code: string;
    postal_code: string;
    state: string;
}

// Moved to package
export interface ShippingAddressChangeCallbackPayload {
    orderId: string;
    shippingAddress: PayPalAddress;
}

// Moved to package
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

// Moved to package
export interface ShippingOptionChangeCallbackPayload {
    orderId: string;
    selectedShippingOption: PayPalSelectedShippingOption;
}

// Moved to package
export interface ApproveCallbackPayload {
    orderID: string;
}

// Moved to package
export interface ApproveCallbackActions {
    order: {
        get: () => PayPalOrderDetails;
    };
}

// Moved to package
export interface CompleteCallbackDataPayload {
    intent: string;
    orderID: string;
}

// Moved to package
export interface PayPalOrderAddress {
    address_line_1: string;
    admin_area_2: string;
    admin_area_1?: string;
    postal_code: string;
    country_code: string;
}

// Moved to package
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

// TODO: this type should be merged with PayPalCheckoutButtonOptions in the future
export interface ButtonsOptions {
    style?: PaypalButtonStyleOptions;
    fundingSource?: string;
    createOrder?(): Promise<string | void>; // TODO: this method should return only Promise<void>
    onApprove?(data: ApproveCallbackPayload, actions?: ApproveCallbackActions): void;
    onShippingAddressChange?(data: ShippingAddressChangeCallbackPayload): Promise<void>;
    onShippingOptionsChange?(data: ShippingOptionChangeCallbackPayload): Promise<void>;
    onComplete?(data: CompleteCallbackDataPayload): void;
    onClick?(data: ClickDataOptions, actions: ClickActions): void;
    onCancel?(): void;
    onError?(error: Error): void;
}

// Moved to package
export interface PaypalCheckoutButtonOptions {
    experience: string;
    style?: PaypalButtonStyleOptions;
    fundingSource: string;
    createOrder(): Promise<string>;
    onError(error: Error): void;
    onShippingAddressChange(data: ShippingAddressChangeCallbackPayload): Promise<void>;
    onShippingOptionsChange(data: ShippingOptionChangeCallbackPayload): Promise<void>;
    onApprove(data: ApproveCallbackPayload, actions: ApproveCallbackActions): Promise<boolean>;
    onComplete(data: CompleteCallbackDataPayload): void;
}

// Moved to package as PaypalCommerceFieldsStyleOptions
export interface PaypalFieldsStyleOptions {
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

// Moved to package as PayPalCommercePaymentFieldsOptions
export interface FieldsOptions {
    style?: PaypalFieldsStyleOptions;
    fundingSource: string;
    fields: { name?: { value?: string }; email?: { value?: string } };
}

// Moved to package
export interface MessagesOptions {
    amount: number;
    placement: string;
    style?: MessagesStyleOptions;
    fundingSource?: string;
}

// Moved to package
export interface MessagesStyleOptions {
    layout?: string;
}

// Moved to package
export interface PaypalCommerceHostedFieldOption {
    selector: string;
    placeholder?: string;
}

// Moved to package
export interface PaypalCommerceHostedFieldsRenderOptions {
    fields?: {
        number?: PaypalCommerceHostedFieldOption;
        cvv?: PaypalCommerceHostedFieldOption;
        expirationDate?: PaypalCommerceHostedFieldOption;
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

// Moved to package
export interface PaypalCommerceHostedFieldsSubmitOptions {
    contingencies?: Array<'3D_SECURE'>;
    cardholderName?: string;
}

// Moved to package
export interface PaypalCommerceHostedFieldsApprove {
    orderId: string;
    liabilityShift: 'POSSIBLE' | 'NO' | 'UNKNOWN';
}

// Moved to package
export interface PaypalCommerceHostedFields {
    submit(options?: PaypalCommerceHostedFieldsSubmitOptions): PaypalCommerceHostedFieldsApprove;
    getState(): PaypalCommerceHostedFieldsState;
    on(eventName: string, callback: (event: PaypalCommerceHostedFieldsState) => void): void;
}

// Moved to package
export interface PaypalCommerceHostedFieldsState {
    cards: PaypalCommerceHostedFieldsCard[];
    emittedBy: string;
    fields: {
        number?: PaypalCommerceHostedFieldsFieldData;
        expirationDate?: PaypalCommerceHostedFieldsFieldData;
        expirationMonth?: PaypalCommerceHostedFieldsFieldData;
        expirationYear?: PaypalCommerceHostedFieldsFieldData;
        cvv?: PaypalCommerceHostedFieldsFieldData;
        postalCode?: PaypalCommerceHostedFieldsFieldData;
    };
}

// Moved to package
export interface PaypalCommerceHostedFieldsCard {
    type: string;
    niceType: string;
    code: { name: string; size: number };
}

// Moved to package
export interface PaypalCommerceHostedFieldsFieldData {
    container: HTMLElement;
    isFocused: boolean;
    isEmpty: boolean;
    isPotentiallyValid: boolean;
    isValid: boolean;
}

// Moved to package
export interface PaypalCommerceButtons {
    render(id: string): void;
    close(): void;
    isEligible(): boolean;
}

// Moved to package as PayPalCommercePaymentFields
export interface PaypalCommerceFields {
    render(id: string): void;
}

// Moved to package
export interface PaypalCommerceMessages {
    render(id: string): void;
}

// Moved to package
export interface PaypalCommerceSDKFunding {
    CARD: string;
    PAYPAL: string;
    CREDIT: string;
    PAYLATER: string;
    BANCONTACT: string;
    GIROPAY: string;
    P24: string;
    EPS: string;
    IDEAL: string;
    MYBANK: string;
    OXXO: string;
    SOFORT: string;
    SEPA: string;
    BLIK: string;
    TRUSTLY: string;
    VERKKOPANKKI: string;
    VENMO: string;
}

export const NON_INSTANT_PAYMENT_METHODS = ['oxxo'];

// Moved to package
export interface PaypalCommerceSDK {
    FUNDING: PaypalCommerceSDKFunding;
    HostedFields: {
        isEligible(): boolean;
        render(data: PaypalCommerceHostedFieldsRenderOptions): Promise<PaypalCommerceHostedFields>;
    };
    Buttons(params: ButtonsOptions | PaypalCheckoutButtonOptions): PaypalCommerceButtons;
    PaymentFields(params: FieldsOptions): PaypalCommerceFields;
    Messages(params: MessagesOptions): PaypalCommerceMessages;
}

// Moved to package
export interface PaypalCommerceHostWindow extends Window {
    paypal?: PaypalCommerceSDK;
    paypalLoadScript?(options: PaypalCommerceScriptParams): Promise<{ paypal: PaypalCommerceSDK }>;
}

// Moved to package
export type FundingType = string[];

// Moved to package
export type EnableFundingType = FundingType | string;

// Moved to package
export enum PayPalCommerceIntent {
    authorize = 'authorize',
    capture = 'capture',
}

// Moved to package
export interface PaypalCommerceInitializationData {
    clientId: string;
    merchantId?: string;
    buyerCountry?: string;
    isDeveloperModeApplicable?: boolean;
    intent?: PayPalCommerceIntent;
    isHostedCheckoutEnabled?: boolean;
    isInlineCheckoutEnabled?: boolean;
    isPayPalCreditAvailable?: boolean;
    availableAlternativePaymentMethods: FundingType;
    enabledAlternativePaymentMethods: FundingType;
    clientToken?: string;
    attributionId?: string;
    isVenmoEnabled?: boolean;
}

// Moved to package
export type ComponentsScriptType = Array<
    'buttons' | 'funding-eligibility' | 'hosted-fields' | 'messages' | 'payment-fields'
>;

// Moved to package
export interface PaypalCommerceScriptParams {
    'client-id'?: string;
    'merchant-id'?: string;
    'buyer-country'?: string;
    'disable-funding'?: FundingType;
    'enable-funding'?: EnableFundingType;
    'data-client-token'?: string;
    'data-partner-attribution-id'?: string;
    currency?: string;
    commit?: boolean;
    intent?: PayPalCommerceIntent;
    components?: ComponentsScriptType;
}

// Moved to package as PayPalUpdateOrderRequestBody
export interface UpdateOrderPayload {
    availableShippingOptions?: ShippingOption[];
    cartId: string;
    selectedShippingOption?: ShippingOption;
}

export interface PayPalCreateOrderRequestBody {
    cartId: string;
    instrumentId?: string;
    shouldSaveInstrument?: boolean;
    shouldSetAsDefaultInstrument?: boolean;
}
