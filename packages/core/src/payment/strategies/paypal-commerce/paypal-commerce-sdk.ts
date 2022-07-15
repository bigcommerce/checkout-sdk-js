import Cart from "../../../cart/cart";

export interface ApproveDataOptions {
    orderID?: string;
}

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

export enum StyleButtonLabel {
    paypal = 'paypal',
    checkout = 'checkout',
    buynow = 'buynow',
    pay = 'pay',
    installment = 'installment',
}

export enum StyleButtonLayout {
    vertical = 'vertical',
    horizontal = 'horizontal',
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
    rect = 'rect' ,
}

export interface PaypalButtonStyleOptions {
    layout?: StyleButtonLayout;
    color?: StyleButtonColor;
    shape?: StyleButtonShape;
    height?: number;
    label?: StyleButtonLabel;
    tagline?: boolean;
}

export interface ButtonsOptions {
    style?: PaypalButtonStyleOptions;
    fundingSource?: string;
    createOrder?(): Promise<string>;
    onApprove?(data: ApproveDataOptions, actions: ApproveActions): void;
    onShippingChange?(data: ShippingChangeData, actions: ApproveActions, cart: Cart): void;
    onClick?(data: ClickDataOptions, actions: ClickActions): void;
    onCancel?(data: OnCancelData): void;
    onError?(error: Error): void;
}

export interface ApproveActions {
    order: {
        get(): Promise<PayerDetails>;
    };
    resolve(): Promise<void>;
    reject(): Promise<void>;
}

export interface PayerDetails {
    payer: {
        name: {
            given_name: string;
            surname: string;
        };
        email_address: string;
        payer_id: string;
        address: {
            country_code: string;
        };
    };
    purchase_units: PurchaseUnits[];
}

export interface ShippingChangeData {
    amount: {
        breakdown: {
            item_total: ItemTotal;
            shipping: ItemTotal;
            tax_total: ItemTotal;
        };
        currency_code: string;
        value: string;
    };
    orderID: string;
    payment_token: string;
    shipping_address: ShippingAddress;
    selected_shipping_option: {
        id: string;
        amount: ItemTotal;
    };
    cartId: string;
    availableShippingOptions: any;
}

export interface ShippingAddress {
    city: string;
    postal_code: string;
    country_code: string;
    state: string;
}

export interface PayPalCommercePaymentMethod {
    initializationData?: PaypalCommerceInitializationData
    id?: string;
}

export interface CurrentShippingAddress {
    city: string;
    countryCode: string;
    postalCode: string;
}

export interface ShippingData extends CurrentShippingAddress{
    firstName: string;
    lastName: string;
    address1: string;
    email: string;
}

export interface OnCancelData {
    orderId: string;
}

interface ItemTotal {
    currency_code: string;
    value: string;
}

export interface ShippingOption {
    id: string;
    type: string;
    label: string;
    selected: boolean;
    amount: ItemTotal;
}

export interface PurchaseUnits {
    reference_id: string;
    amount: ItemTotal;
    payee: {
        email_address: string;
        merchant_id: string;
    };
    shipping: {
        address: {
            address_line_1: string;
            address_area_1: string;
            address_area2: string;
            country_code: string;
            postal_code: string;
        };
        name: {
            full_name: string;
        };
    };
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

export interface MessagesOptions {
    amount: number;
    placement: string;
    style?: MessagesStyleOptions;
    fundingSource?: string;
}

export interface MessagesStyleOptions {
    layout?: string;
}

export interface PaypalCommerceHostedFieldOption {
    selector: string;
    placeholder?: string;
}

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

export interface PaypalCommerceHostedFieldsSubmitOptions {
    contingencies?: Array<'3D_SECURE'>;
    cardholderName?: string;
}

export interface PaypalCommerceHostedFieldsApprove {
    orderId: string;
    liabilityShift: 'POSSIBLE' | 'NO' | 'UNKNOWN';
}

export interface PaypalCommerceHostedFields {
    submit(options?: PaypalCommerceHostedFieldsSubmitOptions): PaypalCommerceHostedFieldsApprove;
    getState(): PaypalCommerceHostedFieldsState;
    on(eventName: string, callback: (event: PaypalCommerceHostedFieldsState) => void): void;
}

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

export interface PaypalCommerceHostedFieldsCard {
    type: string;
    niceType: string;
    code: { name: string; size: number };
}

export interface PaypalCommerceHostedFieldsFieldData {
    container: HTMLElement;
    isFocused: boolean;
    isEmpty: boolean;
    isPotentiallyValid: boolean;
    isValid: boolean;
}

export interface PaypalCommerceButtons {
    render(id: string): void;
    close(): void;
    isEligible(): boolean;
}

export interface PaypalCommerceFields {
    render(id: string): void;
}

export interface PaypalCommerceMessages {
    render(id: string): void;
}

export interface PaypalCommerceSDKFunding {
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
    HostedFields: {
        isEligible(): boolean;
        render(data: PaypalCommerceHostedFieldsRenderOptions): Promise<PaypalCommerceHostedFields>;
    };
    Buttons(params: ButtonsOptions): PaypalCommerceButtons;
    PaymentFields(params: FieldsOptions): PaypalCommerceFields;
    Messages(params: MessagesOptions): PaypalCommerceMessages;
}

export interface PaypalCommerceHostWindow extends Window {
    paypal?: PaypalCommerceSDK;
    paypalLoadScript?(options: PaypalCommerceScriptParams): Promise<{ paypal: PaypalCommerceSDK }>;
}

export type FundingType = string[];
export type EnableFundingType =  FundingType | string;

export interface PaypalCommerceInitializationData {
    clientId: string;
    merchantId?: string;
    buyerCountry?: string;
    isDeveloperModeApplicable?: boolean;
    intent?: 'capture' | 'authorize';
    isHostedCheckoutEnabled?: boolean;
    isInlineCheckoutEnabled?: boolean;
    isPayPalCreditAvailable?: boolean;
    availableAlternativePaymentMethods: FundingType;
    enabledAlternativePaymentMethods: FundingType;
    clientToken?: string;
    attributionId?: string;
    isVenmoEnabled?: boolean;
}

export type ComponentsScriptType = Array<'buttons' | 'messages' | 'hosted-fields' | 'payment-fields'>;

export interface PaypalCommerceScriptParams  {
    'client-id'?: string;
    'merchant-id'?: string;
    'buyer-country'?: string;
    'disable-funding'?: FundingType;
    'enable-funding'?: EnableFundingType;
    'data-client-token'?: string;
    'data-partner-attribution-id'?: string;
    currency?: string;
    commit?: boolean;
    intent?: 'capture' | 'authorize';
    components?: ComponentsScriptType;
}
