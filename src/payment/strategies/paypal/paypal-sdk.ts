export interface PaypalSDK {
    Button: PaypalButton;
    checkout: PaypalExpressCheckout;
    FUNDING: PaypalFundingTypeList;
}

export interface PaypalFundingTypeList {
    CARD: string;
    CREDIT: string;
}

export interface PaypalButton {
    render(options: PaypalButtonOptions, container: string): void;
}

export interface PaypalButtonOptions {
    env?: string;
    commit?: boolean;
    style?: PaypalButtonStyleOptions;
    funding?: PaypalFundingType;
    fundingSource?: string;
    client?: PaypalClientToken;
    payment(data?: PaypalAuthorizeData, actions?: PaypalActions): Promise<any>;
    onAuthorize(data: PaypalAuthorizeData, actions?: PaypalActions): Promise<any>;
}

export interface PaypalClientToken {
    production?: string;
    sandbox?: string;
}

export interface PaypalFundingType {
    allowed?: string[];
    disallowed?: string[];
}

export interface PaypalButtonStyleOptions {
    layout?: 'horizontal' | 'vertical';
    size?: 'small' | 'medium' | 'large' | 'responsive';
    color?: 'gold' | 'blue' | 'silver' | 'black';
    label?: 'checkout' | 'pay' | 'buynow' | 'paypal' | 'credit';
    shape?: 'pill' | 'rect';
    tagline?: boolean;
    fundingicons?: boolean;
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
