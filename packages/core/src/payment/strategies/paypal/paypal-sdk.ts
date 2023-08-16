export interface PaypalSDK {
    Button: PaypalButton;
    checkout: PaypalExpressCheckout;
    FUNDING: PaypalFundingTypeList;
    Messages(options: MessagingOptions): MessagingRender;
    Buttons(options: PaypalButtonOptions): PaypalButtonRender;
}

export interface PaypalFundingTypeList {
    CARD?: string;
    CREDIT?: string;
    PAYPAL?: string;
    PAYLATER?: string;
}

export interface PaypalButton {
    render(options: PaypalButtonOptions, container: string): void;
}

export interface PaypalButtonRender {
    render(container: string): void;
    isEligible(): boolean;
}

export interface MessagingRender {
    render(container: string): void;
}

export interface MessagingOptions {
    amount: number;
    placement: string;
    style?: MessagesStyleOptions;
}

export interface MessagesStyleOptions {
    layout?: 'text' | 'flex';
    logo?: {
        type: 'none' | 'inline' | 'primary';
    };
}

export interface PaypalButtonOptions {
    env?: string;
    commit?: boolean;
    style?: PaypalStyleOptions;
    funding?: PaypalFundingType;
    fundingSource?: string;
    client?: PaypalClientToken;
    payment?(data?: PaypalAuthorizeData, actions?: PaypalActions): Promise<any>;
    onAuthorize?(data: PaypalAuthorizeData, actions?: PaypalActions): Promise<any>;
    createOrder?(data?: PaypalAuthorizeData, actions?: PaypalActions): Promise<any>;
    onApprove?(data?: PaypalAuthorizeData, actions?: PaypalActions): Promise<any>;
}

export interface PaypalClientToken {
    production?: string;
    sandbox?: string;
}

export interface PaypalFundingType {
    allowed?: string[];
    disallowed?: string[];
}

export enum PaypalButtonStyleLayoutOption {
    HORIZONTAL = 'horizontal',
    VERTICAL = 'vertical',
}

export enum PaypalButtonStyleSizeOption {
    SMALL = 'small',
    MEDIUM = 'medium',
    LARGE = 'large',
    RESPONSIVE = 'responsive',
}

export enum PaypalButtonStyleColorOption {
    GOLD = 'gold',
    BLUE = 'blue',
    SIlVER = 'silver',
    BLACK = 'black',
    WHITE = 'white',
}

export enum PaypalButtonStyleLabelOption {
    CHECKOUT = 'checkout',
    PAY = 'pay',
    BUYNOW = 'buynow',
    PAYPAL = 'paypal',
    CREDIT = 'credit',
}

export enum PaypalButtonStyleShapeOption {
    PILL = 'pill',
    RECT = 'rect',
}

export interface PaypalStyleOptions {
    layout?: PaypalButtonStyleLayoutOption;
    size?: PaypalButtonStyleSizeOption;
    color?: PaypalButtonStyleColorOption;
    label?: PaypalButtonStyleLabelOption;
    shape?: PaypalButtonStyleShapeOption;
    tagline?: boolean;
    fundingicons?: boolean;
    height?: number;
}

export interface PaypalActions {
    payment: PaypalPaymentActions;
    request: PaypalRequestActions;
}

export interface PaypalPaymentActions {
    get(id: string): Promise<PaypalPaymentPayload>;
}

export interface PaypalRequestActions {
    post(url: string, payload?: object, options?: object): Promise<{ id: string }>;
}

export interface PaypalTransaction {
    amount?: PaypalAmount;
    payee?: PaypalPayee;
    description?: string;
    note_to_payee?: string;
    item_list?: PaypalItemList;
}

export interface PaypalItemList {
    items?: PaypalItem[];
    shipping_address?: PaypalAddress;
}

export interface PaypalItem {
    sku?: string;
    name?: string;
    description?: string;
    quantity: string;
    price: string;
    currency: string;
    tax?: string;
}

export interface PaypalAmount {
    currency: string;
    total: string;
}

export interface PaypalPayer {
    payer_info: object;
}

export interface PaypalPayee {
    email?: string;
    merchant_id?: string;
}

export interface PaypalAddress {
    line1: string;
    line2?: string;
    city?: string;
    country_code: string;
    postal_code?: string;
    state?: string;
    phone?: string;
    type?: string;
}

export interface PaypalPaymentPayload {
    payment: PaypalPaymentPayload;
    payer: PaypalPayer;
    transactions?: PaypalTransaction[];
}

export interface PaypalAuthorizeData {
    payerId: string;
    paymentId?: string;
    billingToken?: string;
    // the PayPal side of things uses uppercase ID instead of camel case Id
    payerID?: string;
    paymentID?: string;
}

export interface PaypalExpressCheckout {
    initXO(): void;
    startFlow(url: string): void;
    closeFlow(): void;
    setup(merchantId: string, options: PaypalExpressCheckoutOptions): void;
}

export interface PaypalExpressCheckoutOptions {
    button: string;
    environment: string;
}

export interface PaypalHostWindow extends Window {
    paypal?: PaypalSDK;
}
