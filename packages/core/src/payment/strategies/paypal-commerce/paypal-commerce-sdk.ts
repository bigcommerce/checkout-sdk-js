import { ShippingOption } from '../../../shipping';

export interface ClickDataOptions {
    fundingSource: string;
}

export interface ClickActions {
    reject(): Promise<void>;
    resolve(): Promise<void>;
}

export interface OrderData {
    orderId: string;
    approveUrl: string;
}

export interface OrderStatus {
    status: 'APPROVED' | 'CREATED' | string;
}

export enum PaypalStyleButtonLabel {
    paypal = 'paypal',
    checkout = 'checkout',
    buynow = 'buynow',
    pay = 'pay',
    installment = 'installment',
}

export enum PaypalStyleButtonLayout {
    vertical = 'vertical',
    horizontal = 'horizontal',
}

export enum PaypalStyleButtonColor {
    gold = 'gold',
    blue = 'blue',
    silver = 'silver',
    black = 'black',
    white = 'white',
}

export enum PaypalStyleButtonShape {
    pill = 'pill',
    rect = 'rect',
}

export interface PaypalStyleOptions {
    layout?: PaypalStyleButtonLayout;
    color?: PaypalStyleButtonColor;
    shape?: PaypalStyleButtonShape;
    height?: number;
    label?: PaypalStyleButtonLabel;
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

export interface PayPalAddress {
    city: string;
    country_code: string;
    postal_code: string;
    state: string;
}

export interface ShippingAddressChangeCallbackPayload {
    orderId: string;
    shippingAddress: PayPalAddress;
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

export interface ShippingOptionChangeCallbackPayload {
    orderId: string;
    selectedShippingOption: PayPalSelectedShippingOption;
}

export interface ApproveCallbackPayload {
    orderID: string;
}

export interface ApproveCallbackActions {
    order: {
        get: () => PayPalOrderDetails;
    };
}

export interface CompleteCallbackDataPayload {
    intent: string;
    orderID: string;
}

export interface PayPalOrderAddress {
    address_line_1: string;
    admin_area_2: string;
    admin_area_1?: string;
    postal_code: string;
    country_code: string;
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

// TODO: this type should be merged with PayPalCheckoutButtonOptions in the future
export interface ButtonsOptions {
    style?: PaypalStyleOptions;
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

export interface PaypalCheckoutButtonOptions {
    experience: string;
    style?: PaypalStyleOptions;
    fundingSource: string;
    createOrder(): Promise<string>;
    onError(error: Error): void;
    onShippingAddressChange(data: ShippingAddressChangeCallbackPayload): Promise<void>;
    onShippingOptionsChange(data: ShippingOptionChangeCallbackPayload): Promise<void>;
    onApprove(data: ApproveCallbackPayload, actions: ApproveCallbackActions): Promise<boolean>;
    onComplete(data: CompleteCallbackDataPayload): void;
}

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

export interface FieldsOptions {
    style?: PaypalFieldsStyleOptions;
    fundingSource: string;
    fields: { name?: { value?: string }; email?: { value?: string } };
}

export interface PaypalCommerceButtons {
    render(id: string): void;
    close(): void;
    isEligible(): boolean;
}

export interface PaypalCommerceFields {
    render(id: string): void;
}

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

export interface PaypalCommerceSDK {
    FUNDING: PaypalCommerceSDKFunding;
    Buttons(params: ButtonsOptions | PaypalCheckoutButtonOptions): PaypalCommerceButtons;
    PaymentFields(params: FieldsOptions): PaypalCommerceFields;
}

export interface PaypalCommerceHostWindow extends Window {
    paypal?: PaypalCommerceSDK;
    paypalLoadScript?(options: PaypalCommerceScriptParams): Promise<{ paypal: PaypalCommerceSDK }>;
}

export type FundingType = string[];

export type EnableFundingType = FundingType | string;

export enum PayPalCommerceIntent {
    authorize = 'authorize',
    capture = 'capture',
}

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

export type ComponentsScriptType = Array<
    'buttons' | 'funding-eligibility' | 'hosted-fields' | 'messages' | 'payment-fields'
>;

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
