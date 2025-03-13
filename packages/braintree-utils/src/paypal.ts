// the PayPal side of things uses uppercase keys instead of camel case

/**
 *
 * PayPal constants
 *
 */
export const PAYPAL_COMPONENTS = ['buttons', 'messages'];

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

/**
 *
 * PayPal interfaces
 *
 */
export interface PaypalSDK {
    Button: PaypalButton;
    checkout: PaypalExpressCheckout;
    FUNDING: PaypalFundingTypeList;
    Buttons(options: PaypalButtonOptions): PaypalButtonRender;
    Messages(options: MessagingOptions): MessagingRender;
}

export interface PaypalButton {
    render(options: PaypalButtonOptions, container: string): void;
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

export interface MessagingOptions {
    amount: number;
    buyerCountry?: string;
    placement: string;
    style?: MessagesStyleOptions;
}

export interface MessagesStyleOptions {
    color?: string; // 'blue' | 'black' | 'white' | 'white-no-border' | 'gray' | 'monochrome' | 'grayscale'
    layout?: string; // 'text' | 'flex'
    logo?: {
        type?: string; // 'primary' | 'alternative' | 'inline' | 'none'
        position?: string; // 'left' | 'right' | 'top'
    };
    ratio?: string; // '1x1' | '1x4' | '8x1' | '20x1'
    text?: {
        align?: string; // 'left' | 'right' | 'center'
        color?: string; // 'black' | 'white' | 'monochrome' | 'grayscale'
        size?: number; // from 10 to 16
    };
}

export enum MessagingPlacements {
    CART = 'cart',
    PAYMENT = 'payment',
}

export interface MessagingRender {
    render(container: string): void;
}

export interface PaypalButtonOptions {
    env?: string;
    commit?: boolean;
    style?: PaypalStyleOptions;
    funding?: PaypalFundingType;
    fundingSource?: string;
    client?: PaypalClientToken;
    payment?(data?: PaypalAuthorizeData, actions?: PaypalActions): Promise<unknown>;
    onAuthorize?(data: PaypalAuthorizeData, actions?: PaypalActions): Promise<unknown>;
    createOrder?(data?: PaypalAuthorizeData, actions?: PaypalActions): Promise<unknown>;
    onApprove?(data?: PaypalAuthorizeData, actions?: PaypalActions): Promise<unknown>;
    onClick?(): void;
    onCancel?(): void;
    onError?(error: Error): void;
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

export interface PaypalClientToken {
    production?: string;
    sandbox?: string;
}

export interface PaypalFundingType {
    allowed?: string[];
    disallowed?: string[];
}

export interface PaypalActions {
    payment: PaypalPaymentActions;
    request: PaypalRequestActions;
}

export interface PaypalButtonRender {
    render(container: string): void;
    isEligible(): boolean;
    close(): void;
}

export interface PaypalAuthorizeData {
    payerId: string;
    paymentId?: string;
    billingToken?: string;
    payerID?: string;
    paymentID?: string;
}

export interface PaypalFundingTypeList {
    CARD?: string;
    CREDIT?: string;
    PAYPAL?: string;
    PAYLATER?: string;
}

export interface PaypalPaymentActions {
    get(id: string): Promise<unknown>;
}

export interface PaypalRequestActions {
    post(url: string, payload?: object, options?: object): Promise<{ id: string }>;
}
