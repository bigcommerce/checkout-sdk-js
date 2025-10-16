import { CheckoutButtonInitializeOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { CheckoutButtonStrategy } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { CheckoutButtonStrategyFactory } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { FormPoster } from '@bigcommerce/form-poster';
import { Omit } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { OrderRequestBody } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentInitializeOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentRequestOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentStrategy } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentStrategyFactory } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { ScriptLoader } from '@bigcommerce/script-loader';
import { StandardError } from '@bigcommerce/checkout-sdk/payment-integration-api';

declare interface MessagingOptions {
    amount: number;
    placement: string;
}

declare interface MessagingRender {
    render(container: string): void;
}

declare interface PaypalActions {
    payment: PaypalPaymentActions;
    request: PaypalRequestActions;
}

declare interface PaypalAddress {
    line1: string;
    line2?: string;
    city?: string;
    country_code: string;
    postal_code?: string;
    state?: string;
    phone?: string;
    type?: string;
}

declare interface PaypalAmount {
    currency: string;
    total: string;
}

declare interface PaypalAuthorizeData {
    payerId: string;
    paymentId?: string;
    billingToken?: string;
    payerID?: string;
    paymentID?: string;
}

declare interface PaypalButton {
    render(options: PaypalButtonOptions, container: string): void;
}

declare interface PaypalButtonOptions {
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

declare interface PaypalButtonRender {
    render(container: string): void;
    isEligible(): boolean;
}

declare class PaypalButtonStrategy implements CheckoutButtonStrategy {
    private paymentIntegrationService;
    private paypalExpressScriptLoader;
    private formPoster;
    constructor(paymentIntegrationService: PaymentIntegrationService, paypalExpressScriptLoader: PaypalScriptLoader, formPoster: FormPoster);
    initialize(options: CheckoutButtonInitializeOptions & WithPaypalExpressButtonInitializeOptions): Promise<void>;
    deinitialize(): Promise<void>;
    private renderButton;
    private getStyle;
    private setupPayment;
    private tokenizePayment;
}

declare enum PaypalButtonStyleColorOption {
    GOLD = "gold",
    BLUE = "blue",
    SIlVER = "silver",
    BLACK = "black"
}

declare enum PaypalButtonStyleLabelOption {
    CHECKOUT = "checkout",
    PAY = "pay",
    BUYNOW = "buynow",
    PAYPAL = "paypal",
    CREDIT = "credit"
}

declare enum PaypalButtonStyleLayoutOption {
    HORIZONTAL = "horizontal",
    VERTICAL = "vertical"
}

declare enum PaypalButtonStyleShapeOption {
    PILL = "pill",
    RECT = "rect"
}

declare enum PaypalButtonStyleSizeOption {
    SMALL = "small",
    MEDIUM = "medium",
    LARGE = "large",
    RESPONSIVE = "responsive"
}

declare interface PaypalClientToken {
    production?: string;
    sandbox?: string;
}

declare interface PaypalExpressButtonInitializeOptions {
    /**
     * The Client ID of the Paypal App
     */
    clientId: string;
    /**
     * Whether or not to show a credit button.
     */
    allowCredit?: boolean;
    /**
     * A set of styling options for the checkout button.
     */
    style?: Omit<PaypalStyleOptions, 'height'>;
    /**
     * A callback that gets called if unable to authorize and tokenize payment.
     *
     * @param error - The error object describing the failure.
     */
    onAuthorizeError?(error: StandardError): void;
    /**
     * A callback that gets called if unable to submit payment.
     *
     * @param error - The error object describing the failure.
     */
    onPaymentError?(error: StandardError): void;
}

declare interface PaypalExpressCheckout {
    initXO(): void;
    startFlow(url: string): void;
    closeFlow(): void;
    setup(merchantId: string, options: PaypalExpressCheckoutOptions): void;
}

declare interface PaypalExpressCheckoutOptions {
    button: string;
    environment: string;
}

/**
 * A set of options that are required to initialize the PayPal Express payment
 * method.
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'paypalexpress',
 * });
 * ```
 *
 * An additional flag can be passed in to always start the payment flow through
 * a redirect rather than a popup.
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'paypalexpress',
 *     paypalexpress: {
 *         useRedirectFlow: true,
 *     },
 * });
 * ```
 */
declare interface PaypalExpressPaymentInitializeOptions {
    paypalexpress?: {
        useRedirectFlow?: boolean;
    };
}

declare class PaypalExpressPaymentStrategy implements PaymentStrategy {
    private paymentIntegrationService;
    private scriptLoader;
    private paypalSdk?;
    private paymentMethod?;
    private useRedirectFlow;
    private window;
    constructor(paymentIntegrationService: PaymentIntegrationService, scriptLoader: PaypalScriptLoader);
    initialize(options: PaymentInitializeOptions & PaypalExpressPaymentInitializeOptions): Promise<void>;
    deinitialize(): Promise<void>;
    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<undefined>;
    finalize(options?: PaymentRequestOptions): Promise<void>;
    private isAcknowledgedOrFinalized;
    private isInContextEnabled;
}

declare interface PaypalFundingType {
    allowed?: string[];
    disallowed?: string[];
}

declare interface PaypalFundingTypeList {
    CARD?: string;
    CREDIT?: string;
    PAYPAL?: string;
    PAYLATER?: string;
}

declare interface PaypalItem {
    sku?: string;
    name?: string;
    description?: string;
    quantity: string;
    price: string;
    currency: string;
    tax?: string;
}

declare interface PaypalItemList {
    items?: PaypalItem[];
    shipping_address?: PaypalAddress;
}

declare interface PaypalPayee {
    email?: string;
    merchant_id?: string;
}

declare interface PaypalPayer {
    payer_info: object;
}

declare interface PaypalPaymentActions {
    get(id: string): Promise<PaypalPaymentPayload>;
}

declare interface PaypalPaymentPayload {
    payment: PaypalPaymentPayload;
    payer: PaypalPayer;
    transactions?: PaypalTransaction[];
}

declare interface PaypalRequestActions {
    post(url: string, payload?: object, options?: object): Promise<{
        id: string;
    }>;
}

declare interface PaypalSDK {
    Button: PaypalButton;
    checkout: PaypalExpressCheckout;
    FUNDING: PaypalFundingTypeList;
    Messages(options: MessagingOptions): MessagingRender;
    Buttons(options: PaypalButtonOptions): PaypalButtonRender;
}

declare class PaypalScriptLoader {
    private scriptLoader;
    private window;
    constructor(scriptLoader: ScriptLoader);
    loadPaypalSDK(merchantId?: string): Promise<PaypalSDK>;
}

declare interface PaypalStyleOptions {
    layout?: PaypalButtonStyleLayoutOption;
    size?: PaypalButtonStyleSizeOption;
    color?: PaypalButtonStyleColorOption;
    label?: PaypalButtonStyleLabelOption;
    shape?: PaypalButtonStyleShapeOption;
    tagline?: boolean;
    fundingicons?: boolean;
    height?: number;
}

declare interface PaypalTransaction {
    amount?: PaypalAmount;
    payee?: PaypalPayee;
    description?: string;
    note_to_payee?: string;
    item_list?: PaypalItemList;
}

declare interface WithPaypalExpressButtonInitializeOptions {
    paypal: PaypalExpressButtonInitializeOptions;
}

export declare const createPaypalExpressButtonStrategy: import("../../payment-integration-api/src/resolvable-module").default<CheckoutButtonStrategyFactory<PaypalButtonStrategy>, {
    id: string;
}>;

export declare const createPaypalExpressPaymentStrategy: import("../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<PaypalExpressPaymentStrategy>, {
    id: string;
    type: string;
}>;
