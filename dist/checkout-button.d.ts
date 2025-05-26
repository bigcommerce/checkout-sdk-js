import { Address } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { AmazonPayV2ButtonConfig } from '@bigcommerce/checkout-sdk/amazon-pay-utils';
import { AmazonPayV2ButtonParameters } from '@bigcommerce/checkout-sdk/amazon-pay-utils';
import { BraintreeError } from '@bigcommerce/checkout-sdk/braintree-utils';
import { BuyNowCartRequestBody } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaypalStyleOptions as PaypalStyleOptions_2 } from '@bigcommerce/checkout-sdk/braintree-utils';
import { StandardError as StandardError_2 } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { Timeout } from '@bigcommerce/request-sender';
import { createTimeout } from '@bigcommerce/request-sender';

/**
 * The required config to render the AmazonPayV2 button.
 */
declare type AmazonPayV2ButtonInitializeOptions = AmazonPayV2ButtonParameters | WithBuyNowFeature;

/**
 * A set of options that are required to initialize ApplePay in cart.
 *
 * When ApplePay is initialized, an ApplePay button will be inserted into the
 * DOM. When a customer clicks on it, it will trigger Apple sheet.
 */
declare interface ApplePayButtonInitializeOptions {
    /**
     * This option indicates if product requires shipping
     */
    requiresShipping?: boolean;
    /**
     * Enabling a new version of Apple Pay with using Apple Pay SDK
     */
    isWebBrowserSupported?: boolean;
    /**
     * The options that are required to initialize Buy Now functionality.
     */
    buyNowInitializeOptions?: {
        getBuyNowCartRequestBody?(): BuyNowCartRequestBody | void;
    };
    /**
     * A callback that gets called when a payment is successfully completed.
     */
    onPaymentAuthorize(): void;
}

declare interface BaseCheckoutButtonInitializeOptions extends CheckoutButtonOptions {
    [key: string]: unknown;
    /**
     * The ID of a container which the checkout button should be inserted.
     */
    containerId: string;
    /**
     * The option that is required to load payment method configuration for provided currency code in Buy Now flow.
     */
    currencyCode?: string;
    /**
     * The options that are required to facilitate PayPal. They can be omitted
     * unless you need to support Paypal.
     */
    paypal?: PaypalButtonInitializeOptions;
}

/**
 * A set of options that are required to initialize BigCommercePaymentsPayPal in cart or product details page.
 *
 * When BigCommercePaymentsPayPal is initialized, an BigCommercePaymentsPayPal button will be inserted into the
 * DOM. When a customer clicks on it, it will trigger Apple sheet.
 */
declare interface BigCommercePaymentsPayPalButtonInitializeOptions {
    /**
     * The options that are required to initialize Buy Now functionality.
     */
    buyNowInitializeOptions?: PayPalBuyNowInitializeOptions;
    /**
     * The option that used to initialize a PayPal script with provided currency code.
     */
    currencyCode?: string;
    /**
     * A set of styling options for the checkout button.
     */
    style?: PayPalButtonStyleOptions;
    /**
     * A callback that gets called when payment complete on paypal side.
     */
    onComplete?(): void;
    /**
     *
     *  A callback that gets called when PayPal SDK restricts to render PayPal component.
     *
     */
    onEligibilityFailure?(): void;
}

declare interface BoltButtonInitializeOptions {
    /**
     * The options that are required to initialize Buy Now functionality.
     */
    buyNowInitializeOptions?: BoltBuyNowInitializeOptions;
    style?: BoltButtonStyleOptions;
}

declare interface BoltButtonStyleOptions {
    shape?: StyleButtonShape_2;
    size?: StyleButtonSize;
}

declare interface BoltBuyNowInitializeOptions {
    storefrontApiToken?: string;
    getBuyNowCartRequestBody(): BuyNowCartRequestBody;
}

declare interface BraintreePaypalButtonInitializeOptions {
    /**
     * The options that are required to initialize Buy Now functionality.
     */
    buyNowInitializeOptions?: {
        getBuyNowCartRequestBody?(): BuyNowCartRequestBody | void;
    };
    /**
     * The option that used to initialize a PayPal script with provided currency code.
     */
    currencyCode?: string;
    /**
     * A set of styling options for the checkout button.
     */
    style?: Pick<PaypalStyleOptions_2, 'layout' | 'size' | 'color' | 'label' | 'shape' | 'tagline' | 'fundingicons' | 'height'>;
    /**
     * Address to be used for shipping.
     * If not provided, it will use the first saved address from the active customer.
     */
    shippingAddress?: Address | null;
    /**
     * A callback that gets called if unable to authorize and tokenize payment.
     *
     * @param error - The error object describing the failure.
     */
    onAuthorizeError?(error: BraintreeError | StandardError_2): void;
    /**
     * A callback that gets called if unable to submit payment.
     *
     * @param error - The error object describing the failure.
     */
    onPaymentError?(error: BraintreeError | StandardError_2): void;
    /**
     * A callback that gets called on any error instead of submit payment or authorization errors.
     *
     * @param error - The error object describing the failure.
     */
    onError?(error: BraintreeError | StandardError_2): void;
    /**
     *
     *  A callback that gets called when Braintree SDK restricts to render PayPal component.
     *
     */
    onEligibilityFailure?(): void;
}

declare interface BraintreePaypalCreditButtonInitializeOptions {
    /**
     * The options that are required to initialize Buy Now functionality.
     */
    buyNowInitializeOptions?: {
        getBuyNowCartRequestBody?(): BuyNowCartRequestBody | void;
    };
    /**
     * The option that used to initialize a PayPal script with provided currency code.
     */
    currencyCode?: string;
    /**
     * The ID of a container where the messaging component should be inserted.
     */
    messagingContainerId?: string;
    /**
     * A set of styling options for the checkout button.
     */
    style?: Pick<PaypalStyleOptions_2, 'layout' | 'size' | 'color' | 'label' | 'shape' | 'tagline' | 'fundingicons' | 'height'>;
    /**
     * Address to be used for shipping.
     * If not provided, it will use the first saved address from the active customer.
     */
    shippingAddress?: Address | null;
    /**
     * A callback that gets called if unable to authorize and tokenize payment.
     *
     * @param error - The error object describing the failure.
     */
    onAuthorizeError?(error: BraintreeError | StandardError_2): void;
    /**
     * A callback that gets called if unable to submit payment.
     *
     * @param error - The error object describing the failure.
     */
    onPaymentError?(error: BraintreeError | StandardError_2): void;
    /**
     * A callback that gets called on any error instead of submit payment or authorization errors.
     *
     * @param error - The error object describing the failure.
     */
    onError?(error: BraintreeError | StandardError_2): void;
    /**
     *
     *  A callback that gets called when Braintree SDK restricts to render PayPal component.
     *
     */
    onEligibilityFailure?(): void;
}

declare class CheckoutButtonErrorSelector {
    private _checkoutButton;
    getInitializeButtonError(methodId?: CheckoutButtonMethodType): Error | undefined;
    getDeinitializeButtonError(methodId?: CheckoutButtonMethodType): Error | undefined;
}

declare type CheckoutButtonInitializeOptions = BaseCheckoutButtonInitializeOptions & WithAmazonPayV2ButtonInitializeOptions & WithApplePayButtonInitializeOptions & WithBigCommercePaymentsPayPalButtonInitializeOptions & WithBoltButtonInitializeOptions & WithBraintreePaypalButtonInitializeOptions & WithBraintreePaypalCreditButtonInitializeOptions & WithGooglePayButtonInitializeOptions & WithPayPalCommerceButtonInitializeOptions & WithPayPalCommerceCreditButtonInitializeOptions & WithPayPalCommerceVenmoButtonInitializeOptions & WithPayPalCommerceAlternativeMethodsButtonInitializeOptions;

declare class CheckoutButtonInitializer {
    private _store;
    private _buttonStrategyActionCreator;
    private _state;
    /**
     * Returns a snapshot of the current state.
     *
     * The method returns a new instance every time there is a change in the
     * state. You can query the state by calling any of its getter methods.
     *
     * ```js
     * const state = service.getState();
     *
     * console.log(state.errors.getInitializeButtonError());
     * console.log(state.statuses.isInitializingButton());
     * ```
     *
     * @returns The current customer's checkout state
     */
    getState(): CheckoutButtonSelectors;
    /**
     * Subscribes to any changes to the current state.
     *
     * The method registers a callback function and executes it every time there
     * is a change in the current state.
     *
     * ```js
     * service.subscribe(state => {
     *     console.log(state.statuses.isInitializingButton());
     * });
     * ```
     *
     * The method can be configured to notify subscribers only regarding
     * relevant changes, by providing a filter function.
     *
     * ```js
     * const filter = state => state.errors.getInitializeButtonError();
     *
     * // Only trigger the subscriber when the cart changes.
     * service.subscribe(state => {
     *     console.log(state.errors.getInitializeButtonError())
     * }, filter);
     * ```
     *
     * @param subscriber - The function to subscribe to state changes.
     * @param filters - One or more functions to filter out irrelevant state
     * changes. If more than one function is provided, the subscriber will only
     * be triggered if all conditions are met.
     * @returns A function, if called, will unsubscribe the subscriber.
     */
    subscribe(subscriber: (state: CheckoutButtonSelectors) => void, ...filters: Array<(state: CheckoutButtonSelectors) => any>): () => void;
    /**
     * Initializes the checkout button of a payment method.
     *
     * When the checkout button is initialized, it will be inserted into the DOM,
     * ready to be interacted with by the customer.
     *
     * ```js
     * initializer.initializeButton({
     *     methodId: 'braintreepaypal',
     *     containerId: 'checkoutButton',
     *     braintreepaypal: {
     *     },
     * });
     * ```
     *
     * @param options - Options for initializing the checkout button.
     * @returns A promise that resolves to the current state.
     */
    initializeButton(options: CheckoutButtonInitializeOptions): Promise<CheckoutButtonSelectors>;
    /**
     * De-initializes the checkout button by performing any necessary clean-ups.
     *
     * ```js
     * await service.deinitializeButton({
     *     methodId: 'braintreepaypal',
     * });
     * ```
     *
     * @param options - Options for deinitializing the checkout button.
     * @returns A promise that resolves to the current state.
     */
    deinitializeButton(options: CheckoutButtonOptions): Promise<CheckoutButtonSelectors>;
}

declare interface CheckoutButtonInitializerOptions {
    host?: string;
    locale?: string;
}

declare enum CheckoutButtonMethodType {
    APPLEPAY = "applepay",
    AMAZON_PAY_V2 = "amazonpay",
    BRAINTREE_PAYPAL = "braintreepaypal",
    BRAINTREE_VENMO = "braintreevenmo",
    BRAINTREE_PAYPAL_CREDIT = "braintreepaypalcredit",
    GOOGLEPAY_ADYENV2 = "googlepayadyenv2",
    GOOGLEPAY_ADYENV3 = "googlepayadyenv3",
    GOOGLEPAY_AUTHORIZENET = "googlepayauthorizenet",
    GOOGLEPAY_BNZ = "googlepaybnz",
    GOOGLEPAY_BRAINTREE = "googlepaybraintree",
    GOOGLEPAY_CHECKOUTCOM = "googlepaycheckoutcom",
    GOOGLEPAY_CYBERSOURCEV2 = "googlepaycybersourcev2",
    GOOGLEPAY_ORBITAL = "googlepayorbital",
    GOOGLEPAY_STRIPE = "googlepaystripe",
    GOOGLEPAY_STRIPEUPE = "googlepaystripeupe",
    GOOGLEPAY_WORLDPAYACCESS = "googlepayworldpayaccess",
    MASTERPASS = "masterpass",
    PAYPALEXPRESS = "paypalexpress"
}

/**
 * The set of options for configuring the checkout button.
 */
declare interface CheckoutButtonOptions extends RequestOptions {
    /**
     * The identifier of the payment method.
     */
    methodId: CheckoutButtonMethodType;
}

declare interface CheckoutButtonSelectors {
    errors: CheckoutButtonErrorSelector;
    statuses: CheckoutButtonStatusSelector;
}

declare class CheckoutButtonStatusSelector {
    private _checkoutButton;
    isInitializingButton(methodId?: CheckoutButtonMethodType): boolean;
    isDeinitializingButton(methodId?: CheckoutButtonMethodType): boolean;
}

declare interface CustomError extends Error {
    message: string;
    type: string;
    subtype?: string;
}

declare type GooglePayButtonColor = 'default' | 'black' | 'white';

declare interface GooglePayButtonInitializeOptions {
    /**
     * All Google Pay payment buttons exist in two styles: dark (default) and light.
     * To provide contrast, use dark buttons on light backgrounds and light buttons on dark or colorful backgrounds.
     */
    buttonColor?: GooglePayButtonColor;
    /**
     * Variant buttons:
     * book: The "Book with Google Pay" payment button.
     * buy: The "Buy with Google Pay" payment button.
     * checkout: The "Checkout with Google Pay" payment button.
     * donate: The "Donate with Google Pay" payment button.
     * order: The "Order with Google Pay" payment button.
     * pay: The "Pay with Google Pay" payment button.
     * plain: The Google Pay payment button without the additional text (default).
     * subscribe: The "Subscribe with Google Pay" payment button.
     *
     * Note: "long" and "short" button types have been renamed to "buy" and "plain", but are still valid button types
     * for backwards compatability.
     */
    buttonType?: GooglePayButtonType;
}

declare type GooglePayButtonType = 'book' | 'buy' | 'checkout' | 'donate' | 'order' | 'pay' | 'plain' | 'subscribe' | 'long' | 'short';

/**
 * The recognized keys to pass the initialization options for Google Pay.
 */
declare enum GooglePayKey {
    ADYEN_V2 = "googlepayadyenv2",
    ADYEN_V3 = "googlepayadyenv3",
    AUTHORIZE_NET = "googlepayauthorizenet",
    BNZ = "googlepaybnz",
    BRAINTREE = "googlepaybraintree",
    PAYPAL_COMMERCE = "googlepaypaypalcommerce",
    CHECKOUT_COM = "googlepaycheckoutcom",
    CYBERSOURCE_V2 = "googlepaycybersourcev2",
    ORBITAL = "googlepayorbital",
    STRIPE = "googlepaystripe",
    STRIPE_UPE = "googlepaystripeupe",
    WORLDPAY_ACCESS = "googlepayworldpayaccess",
    TD_ONLINE_MART = "googlepaytdonlinemart"
}

declare interface PayPalButtonStyleOptions {
    color?: StyleButtonColor;
    shape?: StyleButtonShape;
    height?: number;
    label?: StyleButtonLabel;
}

declare interface PayPalButtonStyleOptions_2 {
    color?: StyleButtonColor_2;
    shape?: StyleButtonShape_3;
    height?: number;
    label?: StyleButtonLabel_2;
}

/**
 *
 * BigCommerce Payments BuyNow
 *
 */
declare interface PayPalBuyNowInitializeOptions {
    getBuyNowCartRequestBody(): BuyNowCartRequestBody;
}

/**
 *
 * PayPal Commerce BuyNow
 *
 */
declare interface PayPalBuyNowInitializeOptions_2 {
    getBuyNowCartRequestBody(): BuyNowCartRequestBody;
}

declare interface PayPalCommerceAlternativeMethodsButtonOptions {
    /**
     * Alternative payment method id what used for initialization PayPal button as funding source.
     */
    apm: string;
    /**
     * The options that required to initialize Buy Now functionality.
     */
    buyNowInitializeOptions?: PayPalBuyNowInitializeOptions_2;
    /**
     * The option that used to initialize a PayPal script with provided currency code.
     */
    currencyCode?: string;
    /**
     * A set of styling options for the checkout button.
     */
    style?: PayPalButtonStyleOptions_2;
    /**
     *
     *  A callback that gets called when PayPal SDK restricts to render PayPal component.
     *
     */
    onEligibilityFailure?(): void;
}

/**
 * A set of options that are required to initialize PayPalCommerce in cart or product details page.
 *
 * When PayPalCommerce is initialized, an PayPalCommerce button will be inserted into the
 * DOM. When a customer clicks on it, it will trigger Apple sheet.
 */
declare interface PayPalCommerceButtonInitializeOptions {
    /**
     * The options that are required to initialize Buy Now functionality.
     */
    buyNowInitializeOptions?: PayPalBuyNowInitializeOptions_2;
    /**
     * The option that used to initialize a PayPal script with provided currency code.
     */
    currencyCode?: string;
    /**
     * A set of styling options for the checkout button.
     */
    style?: PayPalButtonStyleOptions_2;
    /**
     * A callback that gets called when payment complete on paypal side.
     */
    onComplete?(): void;
    /**
     *
     *  A callback that gets called when PayPal SDK restricts to render PayPal component.
     *
     */
    onEligibilityFailure?(): void;
}

declare interface PayPalCommerceCreditButtonInitializeOptions {
    /**
     * The ID of a container which the messaging should be inserted.
     */
    messagingContainerId?: string;
    /**
     * A set of styling options for the checkout button.
     */
    style?: PayPalButtonStyleOptions_2;
    /**
     * The option that used to initialize a PayPal script with provided currency code.
     */
    currencyCode?: string;
    /**
     * The options that are required to initialize Buy Now functionality.
     */
    buyNowInitializeOptions?: PayPalBuyNowInitializeOptions_2;
    /**
     * A callback that gets called when payment complete on paypal side.
     */
    onComplete?(): void;
    /**
     *
     *  A callback that gets called when PayPal SDK restricts to render PayPal component.
     *
     */
    onEligibilityFailure?(): void;
}

declare interface PayPalCommerceVenmoButtonInitializeOptions {
    /**
     * A set of styling options for the checkout button.
     */
    style?: PayPalButtonStyleOptions_2;
    /**
     * The option that used to initialize a PayPal script with provided currency code.
     */
    currencyCode?: string;
    /**
     * The options that required to initialize Buy Now functionality.
     */
    buyNowInitializeOptions?: PayPalBuyNowInitializeOptions_2;
    /**
     *
     *  A callback that gets called when PayPal SDK restricts to render PayPal component.
     *
     */
    onEligibilityFailure?(): void;
}

declare interface PaypalButtonInitializeOptions {
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
    style?: Pick<PaypalStyleOptions, 'layout' | 'size' | 'color' | 'label' | 'shape' | 'tagline' | 'fundingicons'>;
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

declare enum PaypalButtonStyleColorOption {
    GOLD = "gold",
    BLUE = "blue",
    SIlVER = "silver",
    BLACK = "black",
    WHITE = "white"
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

/**
 * A set of options for configuring an asynchronous request.
 */
declare interface RequestOptions<TParams = {}> {
    /**
     * Provide this option if you want to cancel or time out the request. If the
     * timeout object completes before the request, the request will be
     * cancelled.
     */
    timeout?: Timeout;
    /**
     * The parameters of the request, if required.
     */
    params?: TParams;
}

/**
 * This error type should not be constructed directly. It is a base class for
 * all custom errors thrown in this library.
 */
declare abstract class StandardError extends Error implements CustomError {
    name: string;
    type: string;
    constructor(message?: string);
}

declare enum StyleButtonColor {
    gold = "gold",
    blue = "blue",
    silver = "silver",
    black = "black",
    white = "white"
}

declare enum StyleButtonColor_2 {
    gold = "gold",
    blue = "blue",
    silver = "silver",
    black = "black",
    white = "white"
}

declare enum StyleButtonLabel {
    paypal = "paypal",
    checkout = "checkout",
    buynow = "buynow",
    pay = "pay",
    installment = "installment"
}

declare enum StyleButtonLabel_2 {
    paypal = "paypal",
    checkout = "checkout",
    buynow = "buynow",
    pay = "pay",
    installment = "installment"
}

declare enum StyleButtonShape {
    pill = "pill",
    rect = "rect"
}

declare enum StyleButtonShape_2 {
    Pill = "pill",
    Rect = "rect"
}

declare enum StyleButtonShape_3 {
    pill = "pill",
    rect = "rect"
}

declare enum StyleButtonSize {
    Small = "small",
    Medium = "medium",
    Large = "large"
}

declare interface WithAmazonPayV2ButtonInitializeOptions {
    amazonpay?: AmazonPayV2ButtonInitializeOptions;
}

declare interface WithApplePayButtonInitializeOptions {
    applepay?: ApplePayButtonInitializeOptions;
}

declare interface WithBigCommercePaymentsPayPalButtonInitializeOptions {
    bigcommerce_payments_paypal?: BigCommercePaymentsPayPalButtonInitializeOptions;
}

declare interface WithBoltButtonInitializeOptions {
    /**
     * The options that are required to initialize the Bolt payment
     * method. They can be omitted unless you need to support Bolt.
     */
    bolt?: BoltButtonInitializeOptions;
}

declare interface WithBraintreePaypalButtonInitializeOptions {
    /**
     * The options that are required to initialize Braintree PayPal wallet button on Product and Cart page.
     */
    braintreepaypal?: BraintreePaypalButtonInitializeOptions;
}

declare interface WithBraintreePaypalCreditButtonInitializeOptions {
    /**
     * The options that are required to initialize Braintree PayPal Credit wallet button on Product and Cart page.
     */
    braintreepaypalcredit?: BraintreePaypalCreditButtonInitializeOptions;
}

declare interface WithBuyNowFeature extends AmazonPayV2ButtonConfig {
    /**
     * The options that are required to initialize Buy Now functionality.
     */
    buyNowInitializeOptions?: {
        getBuyNowCartRequestBody?(): BuyNowCartRequestBody | void;
    };
}

/**
 * The options that are required to initialize the GooglePay payment method.
 * They can be omitted unless you need to support GooglePay.
 */
declare type WithGooglePayButtonInitializeOptions = {
    [k in GooglePayKey]?: GooglePayButtonInitializeOptions;
};

declare interface WithPayPalCommerceAlternativeMethodsButtonInitializeOptions {
    paypalcommercealternativemethods?: PayPalCommerceAlternativeMethodsButtonOptions;
}

declare interface WithPayPalCommerceButtonInitializeOptions {
    paypalcommerce?: PayPalCommerceButtonInitializeOptions;
}

declare interface WithPayPalCommerceCreditButtonInitializeOptions {
    paypalcommercecredit?: PayPalCommerceCreditButtonInitializeOptions;
}

declare interface WithPayPalCommerceVenmoButtonInitializeOptions {
    paypalcommercevenmo?: PayPalCommerceVenmoButtonInitializeOptions;
}

/**
 * Creates an instance of `CheckoutButtonInitializer`.
 *
 * @remarks
 * ```js
 * const initializer = createCheckoutButtonInitializer();
 *
 * initializer.initializeButton({
 *     methodId: 'braintreepaypal',
 *     braintreepaypal: {
 *         container: '#checkoutButton',
 *     },
 * });
 * ```
 *
 * @alpha
 * Please note that `CheckoutButtonInitializer` is currently in an early stage
 * of development. Therefore the API is unstable and not ready for public
 * consumption.
 *
 * @param options - A set of construction options.
 * @returns an instance of `CheckoutButtonInitializer`.
 */
export declare function createCheckoutButtonInitializer(options?: CheckoutButtonInitializerOptions): CheckoutButtonInitializer;
