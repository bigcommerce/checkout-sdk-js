import { Timeout } from '@bigcommerce/request-sender';
import { createTimeout } from '@bigcommerce/request-sender';

declare interface Address extends AddressRequestBody {
    country: string;
    shouldSaveAddress?: boolean;
}

declare interface AddressRequestBody {
    firstName: string;
    lastName: string;
    company: string;
    address1: string;
    address2: string;
    city: string;
    stateOrProvince: string;
    stateOrProvinceCode: string;
    countryCode: string;
    postalCode: string;
    phone: string;
    customFields: Array<{
        fieldId: string;
        fieldValue: string | number | string[];
    }>;
}

/**
 * The required config to render the AmazonPayV2 buttton.
 */
declare type AmazonPayV2ButtonInitializeOptions = AmazonPayV2ButtonParams;

declare interface AmazonPayV2ButtonParams {
    /**
     * Amazon Pay merchant account identifier.
     */
    merchantId: string;
    /**
     * Configuration for calling the endpoint to Create Checkout Session.
     */
    createCheckoutSession: AmazonPayV2CheckoutSession;
    /**
     * Placement of the Amazon Pay button on your website.
     */
    placement: AmazonPayV2Placement;
    /**
     * Ledger currency provided during registration for the given merchant identifier.
     */
    ledgerCurrency: AmazonPayV2LedgerCurrency;
    /**
     * Product type selected for checkout. Default is 'PayAndShip'.
     */
    productType?: AmazonPayV2PayOptions;
    /**
     * Language used to render the button and text on Amazon Pay hosted pages.
     */
    checkoutLanguage?: AmazonPayV2CheckoutLanguage;
    /**
     * Sets button to Sandbox environment. Default is false.
     */
    sandbox?: boolean;
}

declare enum AmazonPayV2CheckoutLanguage {
    en_US = "en_US",
    en_GB = "en_GB",
    de_DE = "de_DE",
    fr_FR = "fr_FR",
    it_IT = "it_IT",
    es_ES = "es_ES",
    ja_JP = "ja_JP"
}

declare interface AmazonPayV2CheckoutSession {
    /**
     * Endpoint URL to Create Checkout Session.
     */
    url: string;
    /**
     * HTTP request method. Default is 'POST'.
     */
    method?: 'GET' | 'POST';
    /**
     * Checkout Session ID parameter in the response. Default is 'checkoutSessionId'.
     */
    extractAmazonCheckoutSessionId?: string;
}

declare enum AmazonPayV2LedgerCurrency {
    USD = "USD",
    EUR = "EUR",
    GBP = "GBP",
    JPY = "JPY"
}

declare enum AmazonPayV2PayOptions {
    /** Select this product type if you need the buyer's shipping details. */
    PayAndShip = "PayAndShip",
    /** Select this product type if you do not need the buyer's shipping details. */
    PayOnly = "PayOnly"
}

declare enum AmazonPayV2Placement {
    /** Initial or main page. */
    Home = "Home",
    /** Product details page. */
    Product = "Product",
    /** Cart review page before buyer starts checkout. */
    Cart = "Cart",
    /** Any page after buyer starts checkout. */
    Checkout = "Checkout",
    /** Any page that doesn't fit the previous descriptions. */
    Other = "Other"
}

declare interface BraintreeError extends Error {
    type: 'CUSTOMER' | 'MERCHANT' | 'NETWORK' | 'INTERNAL' | 'UNKNOWN';
    code: string;
    message: string;
}

declare interface BraintreePaypalButtonInitializeOptions {
    /**
     * A set of styling options for the checkout button.
     */
    style?: Pick<PaypalButtonStyleOptions, 'layout' | 'size' | 'color' | 'label' | 'shape' | 'tagline' | 'fundingicons' | 'height'>;
    /**
     * Whether or not to show a credit button.
     */
    allowCredit?: boolean;
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
    onAuthorizeError?(error: BraintreeError | StandardError): void;
    /**
     * A callback that gets called if unable to submit payment.
     *
     * @param error - The error object describing the failure.
     */
    onPaymentError?(error: BraintreeError | StandardError): void;
}

declare enum ButtonColor {
    Default = "default",
    Black = "black",
    White = "white"
}

declare enum ButtonType {
    Long = "long",
    Short = "short"
}

declare class CheckoutButtonErrorSelector {
    private _checkoutButton;
    getInitializeButtonError(methodId?: CheckoutButtonMethodType): Error | undefined;
    getDeinitializeButtonError(methodId?: CheckoutButtonMethodType): Error | undefined;
}

declare interface CheckoutButtonInitializeOptions extends CheckoutButtonOptions {
    /**
     * The options that are required to facilitate AmazonPayV2. They can be
     * omitted unless you need to support AmazonPayV2.
     */
    amazonpay?: AmazonPayV2ButtonInitializeOptions;
    /**
     * The options that are required to facilitate Braintree PayPal. They can be
     * omitted unless you need to support Braintree PayPal.
     */
    braintreepaypal?: BraintreePaypalButtonInitializeOptions;
    /**
     * The options that are required to facilitate Braintree Credit. They can be
     * omitted unless you need to support Braintree Credit.
     */
    braintreepaypalcredit?: BraintreePaypalButtonInitializeOptions;
    /**
     * The options that are required to facilitate PayPal. They can be omitted
     * unless you need to support Paypal.
     */
    paypal?: PaypalButtonInitializeOptions;
    /**
     * The options that are required to facilitate PayPal Commerce. They can be omitted
     * unless you need to support Paypal.
     */
    paypalCommerce?: PaypalCommerceButtonInitializeOptions;
    /**
     * The ID of a container which the checkout button should be inserted.
     */
    containerId: string;
    /**
     * The options that are required to initialize the GooglePay payment method.
     * They can be omitted unless you need to support adyenv2 GooglePay.
     */
    googlepayadyenv2?: GooglePayButtonInitializeOptions;
    /**
     * The options that are required to facilitate Braintree GooglePay. They can be
     * omitted unless you need to support Braintree GooglePay.
     */
    googlepaybraintree?: GooglePayButtonInitializeOptions;
    /**
     * The options that are required to facilitate Checkout.com GooglePay. They can be
     * omitted unless you need to support Checkout.com GooglePay.
     */
    googlepaycheckoutcom?: GooglePayButtonInitializeOptions;
    /**
     * The options that are required to facilitate CybersourceV2 GooglePay. They can be
     * omitted unless you need to support CybersourceV2 GooglePay.
     */
    googlepaycybersourcev2?: GooglePayButtonInitializeOptions;
    /**
     * The options that are required to facilitate Orbital GooglePay. They can be
     * omitted unless you need to support Orbital GooglePay.
     */
    googlepayorbital?: GooglePayButtonInitializeOptions;
    /**
     * The options that are required to facilitate Stripe GooglePay. They can be
     * omitted unless you need to support Stripe GooglePay.
     */
    googlepaystripe?: GooglePayButtonInitializeOptions;
    /**
     * The options that are required to facilitate Authorize.Net GooglePay.
     * They can be omitted unless you need to support Authorize.Net GooglePay.
     */
    googlepayauthorizenet?: GooglePayButtonInitializeOptions;
}

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
    AMAZON_PAY_V2 = "amazonpay",
    BRAINTREE_PAYPAL = "braintreepaypal",
    BRAINTREE_PAYPAL_CREDIT = "braintreepaypalcredit",
    GOOGLEPAY_ADYENV2 = "googlepayadyenv2",
    GOOGLEPAY_AUTHORIZENET = "googlepayauthorizenet",
    GOOGLEPAY_BRAINTREE = "googlepaybraintree",
    GOOGLEPAY_CHECKOUTCOM = "googlepaycheckoutcom",
    GOOGLEPAY_CYBERSOURCEV2 = "googlepaycybersourcev2",
    GOOGLEPAY_ORBITAL = "googlepayorbital",
    GOOGLEPAY_STRIPE = "googlepaystripe",
    MASTERPASS = "masterpass",
    PAYPALEXPRESS = "paypalexpress",
    PAYPALCOMMERCE = "paypalcommerce"
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

declare interface GooglePayButtonInitializeOptions {
    /**
     * The color of the GooglePay button that will be inserted.
     *  black (default): a black button suitable for use on white or light backgrounds.
     *  white: a white button suitable for use on colorful backgrounds.
     */
    buttonColor?: ButtonColor;
    /**
     * The size of the GooglePay button that will be inserted.
     *  long: "Buy with Google Pay" button (default). A translated button label may appear
     *         if a language specified in the viewer's browser matches an available language.
     *  short: Google Pay payment button without the "Buy with" text.
     */
    buttonType?: ButtonType;
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
    style?: Pick<PaypalButtonStyleOptions, 'layout' | 'size' | 'color' | 'label' | 'shape' | 'tagline' | 'fundingicons'>;
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

declare interface PaypalButtonStyleOptions {
    layout?: 'horizontal' | 'vertical';
    size?: 'small' | 'medium' | 'large' | 'responsive';
    color?: 'gold' | 'blue' | 'silver' | 'black';
    label?: 'checkout' | 'pay' | 'buynow' | 'paypal' | 'credit';
    shape?: 'pill' | 'rect';
    tagline?: boolean;
    fundingicons?: boolean;
    height?: number;
}

declare interface PaypalButtonStyleOptions_2 {
    layout?: StyleButtonLayout;
    color?: StyleButtonColor;
    shape?: StyleButtonShape;
    height?: 25 | 26 | 27 | 28 | 29 | 30 | 31 | 32 | 33 | 34 | 35 | 36 | 37 | 38 | 39 | 40 | 41 | 42 | 43 | 44 | 45 | 46 | 47 | 48 | 49 | 50 | 51 | 52 | 53 | 54 | 55;
    label?: StyleButtonLabel;
    tagline?: boolean;
}

declare interface PaypalCommerceButtonInitializeOptions {
    /**
     * A set of styling options for the checkout button.
     */
    style?: PaypalButtonStyleOptions_2;
    /**
     * Container id for messaging banner container
     */
    messagingContainer?: string;
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

declare enum StyleButtonLabel {
    paypal = "paypal",
    checkout = "checkout",
    buynow = "buynow",
    pay = "pay",
    installment = "installment"
}

declare enum StyleButtonLayout {
    vertical = "vertical",
    horizontal = "horizontal"
}

declare enum StyleButtonShape {
    pill = "pill",
    rect = "rect"
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
