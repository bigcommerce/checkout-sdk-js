import { CustomerCredentials } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { CustomerInitializeOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { CustomerStrategy } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { CustomerStrategyFactory } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { ExecutePaymentMethodCheckoutOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { LoadingIndicator } from '@bigcommerce/checkout-sdk/ui';
import { OrderRequestBody } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentInitializeOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentRequestOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentStrategy } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentStrategyFactory } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { RequestOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { ScriptLoader } from '@bigcommerce/script-loader';

declare interface Address {
    city: string;
    country: string;
    line1: string;
    line2?: string;
    postal_code: string;
    state: string;
}

/**
 * Object definition for part of the data sent to confirm the PaymentIntent.
 * https://stripe.com/docs/api/payment_intents/confirm#confirm_payment_intent-shipping
 */
declare type AddressOptions = Partial<Address>;

/**
 * Object definition for part of the data sent to confirm the PaymentIntent.
 * https://stripe.com/docs/js/elements_object/create_payment_element
 */
declare interface AddressProperties {
    city?: AutoOrNever;
    country?: AutoOrNever;
    state?: AutoOrNever;
    postalCode?: AutoOrNever;
    line1?: AutoOrNever;
    line2?: AutoOrNever;
}

declare type AutoOrNever = StripeStringConstants.AUTO | StripeStringConstants.NEVER;

/**
 * Object definition for part of the data sent to confirm the PaymentIntent.
 */
declare interface BillingDetailsOptions {
    name?: string;
    email?: string;
    address?: AddressOptions;
    phone?: string;
}

/**
 * Object definition for part of the data sent to confirm the PaymentIntent.
 */
declare interface BillingDetailsProperties {
    name?: AutoOrNever;
    email?: AutoOrNever;
    address?: AutoOrNever | AddressProperties;
    phone?: AutoOrNever;
}

/**
 * This object is used to pass custom fonts when creating an [Elements](https://stripe.com/docs/js/elements_object/create) object.
 */
declare interface CssFontSource {
    /**
     * A relative or absolute URL pointing to a CSS file with [@font-face](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face) definitions, for example:
     * `https://fonts.googleapis.com/css?family=Open+Sans`
     * Note that if you are using a [content security policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy) (CSP),
     * [additional directives](https://stripe.com/docs/security#content-security-policy) may be necessary.
     */
    cssSrc: string;
}

/**
 * This object is used to pass custom fonts when creating an [Elements](https://stripe.com/docs/js/elements_object/create) object.
 */
declare interface CustomFontSource {
    /**
     * The name to give the font.
     */
    family: string;
    /**
     * A valid [src](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/src) value pointing to your
     * custom font file. This is usually (though not always) a link to a file with a .woff , .otf, or .svg suffix.
     */
    src: string;
    /**
     * A valid [font-display](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display) value.
     */
    display?: string;
    /**
     * One of normal, italic, oblique. Defaults to normal.
     */
    style?: string;
    /**
     * A valid [unicode-range](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/unicode-range) value.
     */
    unicodeRange?: string;
    /**
     * A valid [font-weight](https://developer.mozilla.org/en-US/docs/Web/CSS/font-weight). Note that this is a string, not a number.
     */
    weight?: string;
}

declare interface CustomerDefaultValues {
    mode: StripeFormMode;
    email: string;
    allowedCountries?: string[];
    display?: {
        name: DisplayName;
    };
}

declare enum DisplayName {
    SPLIT = "split",
    FULL = "full",
    ORGANIZATION = "organization"
}

declare interface FieldsOptions {
    billingDetails?: AutoOrNever | BillingDetailsProperties;
    phone?: string;
}

/**
 * The payment error encountered in the previous PaymentIntent confirmation. It will be cleared if the PaymentIntent is later updated for any reason.
 */
declare interface LastPaymentError {
    /**
     * A human-readable message providing more details about the error. For card errors, these messages can be shown to your users.
     */
    message?: string;
}

declare interface LineItem {
    name: string;
    amount: number;
}

declare interface PaymentDefaultValues {
    savePaymentMethod?: boolean;
    billingDetails?: BillingDetailsOptions;
}

/**
 * The PaymentIntent object.
 */
declare interface PaymentIntent {
    /**
     * Unique identifier for the object.
     */
    id: string;
    /**
     * The client secret of the PaymentIntent. Used for client-side retrieval using a publishable key.
     */
    client_secret?: string;
    /**
     * Status of this PaymentIntent. Read more about each PaymentIntent [status](https://stripe.com/docs/payments/intents#intent-statuses).
     */
    status: 'succeeded' | string;
    /**
     * The payment error encountered in the previous PaymentIntent confirmation. It will be cleared if the PaymentIntent is later updated for any reason.
     */
    last_payment_error: LastPaymentError | null;
    payment_method_options?: StripePIPaymentMethodOptions;
}

/**
 * Object definition for part of the data sent to confirm the PaymentIntent.
 */
declare interface PaymentMethodDataOptions {
    billing_details: BillingDetailsOptions;
    allow_redisplay?: 'always' | 'limited' | 'unspecified';
}

declare interface ShippingDefaultValues {
    name?: string;
    firstName?: string;
    lastName?: string;
    phone: string;
    address: Address;
}

declare interface StripeAdditionalActionRequired {
    type: string;
    data: {
        token?: string;
        redirect_url?: string;
    };
}

/**
 * All available options are here https://stripe.com/docs/stripe-js/appearance-api#supported-css-properties
 */
declare interface StripeAppearanceOptions {
    variables?: Record<string, StripeAppearanceValues>;
    rules?: Record<string, Record<string, StripeAppearanceValues>>;
}

declare type StripeAppearanceValues = string | string[] | number | undefined;

declare interface StripeClient {
    /**
     * Use confirmPayment to confirm a PaymentIntent using data collected by the Payment Element.
     * When called, confirmPayment will attempt to complete any required actions,
     * such as authenticating your user by displaying a 3DS dialog or redirecting them to a bank authorization page.
     */
    confirmPayment(options: StripeConfirmPaymentData): Promise<StripeResult>;
    /**
     * When called, it will confirm the PaymentIntent with data you provide and carry out 3DS or other next actions if they are required.
     */
    confirmCardPayment(clientSecret: string): Promise<StripeResult>;
    /**
     * Retrieve a PaymentIntent using its client secret.
     */
    retrievePaymentIntent(clientSecret: string): Promise<StripeResult>;
    /**
     * Create an `Elements` instance, which manages a group of elements.
     */
    elements(options: StripeElementsOptions): StripeElements;
}

/**
 * Initialization options.
 */
declare interface StripeConfigurationOptions {
    /**
     * For usage with [Connect](https://stripe.com/docs/connect) only.
     * Specifying a connected account ID (e.g., acct_24BFMpJ1svR5A89k) allows you to perform actions on behalf of that account.
     */
    stripeAccount?: string;
    /**
     * Override your account's [API version](https://stripe.com/docs/api/versioning)
     */
    apiVersion?: string;
    /**
     * A locale used to globally configure localization in Stripe. Setting the locale here will localize error strings for all Stripe.js methods. It will also configure the locale for Elements and Checkout. Default is auto (Stripe detects the locale of the browser).
     * Note that Checkout supports a slightly different set of locales than Stripe.js.
     */
    locale?: string;
    betas?: string[];
}

/**
 * Parameters that will be passed on to the Stripe API to confirm the PaymentIntent.
 */
declare interface StripeConfirmParams {
    return_url?: string;
    payment_method_data?: PaymentMethodDataOptions;
}

/**
 * Data to be sent with a `stripe.confirmPayment` request.
 * Refer to the [Payment Intents API](https://stripe.com/docs/js/payment_intents/confirm_payment) for a full list of parameters.
 */
declare interface StripeConfirmPaymentData {
    /**
     * The Elements instance that was used to create the Payment Element.
     */
    elements: StripeElements;
    /**
     * Parameters that will be passed on to the Stripe API to confirm the PaymentIntent.
     */
    confirmParams?: StripeConfirmParams;
    /**
     * By default, confirmPayment will always redirect to your return_url after a successful confirmation.
     * If you set redirect: "if_required", then confirmPayment will only redirect if your user chooses a redirect-based payment method.
     */
    redirect?: StripeStringConstants.ALWAYS | StripeStringConstants.IF_REQUIRED;
    clientSecret?: string;
}

declare type StripeCustomFont = CssFontSource | CustomFontSource;

declare interface StripeCustomerEvent extends StripeEvent {
    collapsed?: boolean;
    authenticated: boolean;
    value: {
        email: string;
    };
}

declare interface StripeElement {
    /**
     * The `element.mount` method attaches your element to the DOM.
     */
    mount(domElement: string | HTMLElement): void;
    /**
     * Removes the element from the DOM and destroys it.
     * A destroyed element can not be re-activated or re-mounted to the DOM.
     */
    destroy(): void;
    /**
     * Unmounts the element from the DOM.
     * Call `element.mount` to re-attach it to the DOM.
     */
    unmount(): void;
    /**
     * The change event is triggered when the Element's value changes. The event payload always contains certain keys,
     * in addition to some Element-specific keys.
     * https://stripe.com/docs/js/element/events/on_change?type=paymentElement
     */
    on(event: StripeElementEvent, handler: (event: StripeEventType) => void): void;
    /**
     * Updates the options the Payment Element was initialized with. Updates are merged into the existing configuration.
     * https://docs.stripe.com/js/elements_object/update_payment_element
     */
    update(options?: StripeElementsCreateOptions): void;
    /**
     * This method collapses the Payment Element into a row of payment method tabs.
     * https://docs.stripe.com/js/elements_object/collapse_payment_element
     */
    collapse(): void;
}

declare enum StripeElementEvent {
    CLICK = "click",
    CHANGE = "change",
    READY = "ready",
    SHIPPING_ADDRESS_CHANGE = "shippingaddresschange",
    SHIPPING_RATE_CHANGE = "shippingratechange",
    CONFIRM = "confirm",
    CANCEL = "cancel",
    LOADER_START = "loaderstart"
}

declare enum StripeElementType {
    PAYMENT = "payment",
    AUTHENTICATION = "linkAuthentication",
    SHIPPING = "address",
    EXPRESS_CHECKOUT = "expressCheckout"
}

declare interface StripeElementUpdateOptions {
    shouldShowTerms?: boolean;
}

declare interface StripeElements {
    /**
     * Creates an Elements instance, which manages a group of elements.
     * https://stripe.com/docs/js/elements_object/create
     */
    create(elementType: StripeElementType, options?: StripeElementsCreateOptions): StripeElement;
    /**
     * Looks up a previously created element.
     * https://stripe.com/docs/js/elements_object/get_payment_element or
     * https://stripe.com/docs/js/elements_object/get_link_authentication_element
     */
    getElement(elementType: StripeElementType): StripeElement | null;
    /**
     * Updates options on an existing instance of Elements.
     * https://stripe.com/docs/js/elements_object/update
     */
    update(options?: StripeUpdateElementsOptions): StripeElement;
    /**
     * Fetches updates from the associated PaymentIntent or SetupIntent on an existing instance of Elements,
     * and reflects these updates in the Payment Element.
     * https://stripe.com/docs/js/elements_object/fetch_updates
     */
    fetchUpdates(): Promise<void>;
}

/**
 * All available options are here https://stripe.com/docs/js/elements_object/create_payment_element
 */
declare interface StripeElementsCreateOptions {
    mode?: string;
    fields?: FieldsOptions;
    wallets?: WalletOptions;
    allowedCountries?: string[];
    defaultValues?: ShippingDefaultValues | CustomerDefaultValues | PaymentDefaultValues;
    validation?: validationElement;
    display?: {
        name: DisplayName;
    };
    terms?: TermOptions;
    layout?: StripeLayoutOptions;
    paymentMethodOrder?: string[];
    lineItems?: LineItem[];
    allowedShippingCountries?: string[];
    shippingAddressRequired?: boolean;
    shippingRates?: StripeLinkV2ShippingRate[];
    billingAddressRequired?: boolean;
    emailRequired?: boolean;
    phoneNumberRequired?: boolean;
    paymentMethods?: {
        link: StripeStringConstants.AUTO;
        applePay: StripeStringConstants.NEVER;
        googlePay: StripeStringConstants.NEVER;
        amazonPay: StripeStringConstants.NEVER;
        paypal: StripeStringConstants.NEVER;
        klarna: StripeStringConstants.NEVER;
    };
    buttonHeight?: number;
    savePaymentMethod?: StripeSavePaymentMethod;
}

declare interface StripeElementsOptions {
    /**
     * An array of custom fonts, which elements created from the Elements object can use.
     * Fonts can be specified as [CssFontSource](https://stripe.com/docs/js/appendix/css_font_source_object)
     * or [CustomFontSource](https://stripe.com/docs/js/appendix/custom_font_source_object) objects.
     */
    fonts?: StripeCustomFont[];
    /**
     * A [locale](https://stripe.com/docs/js/appendix/supported_locales) to display placeholders and
     * error strings in. Default is auto (Stripe detects the locale of the browser).
     * Setting the locale does not affect the behavior of postal code validation—a valid postal code
     * for the billing country of the card is still required.
     */
    locale?: string;
    /**
     * The client secret of this PaymentIntent. Used for client-side retrieval using a publishable key.
     * The client secret can be used to complete a payment from your frontend.
     * It should not be stored, logged, embedded in URLs, or exposed to anyone other than the customer.
     * Make sure that you have TLS enabled on any page that includes the client secret.
     * Refer to our docs to accept a payment and learn about how client_secret should be handled.
     */
    clientSecret?: string;
    /**
     * A token that represents the Stripe customer session.
     * Stripe documentation: https://docs.stripe.com/api/checkout/sessions
     */
    customerSessionClientSecret?: string;
    /**
     * Match the design of your site with the appearance option.
     * The layout of each Element stays consistent, but you can modify colors, fonts, borders, padding, and more.
     */
    appearance?: StripeAppearanceOptions;
    mode?: string;
    amount?: number;
    currency?: string;
    paymentMethodTypes?: string[];
}

declare interface StripeError {
    /**
     * type of error. When the error type is card_error or validation_error, you can display the error message in error.message directly to your user.
     */
    type: string;
    /**
     * A human-readable message providing more details about the error. For card errors, these messages can be shown to your users.
     */
    message?: string;
    /**
     * The PaymentIntent object.
     */
    payment_intent: PaymentIntent;
}

declare interface StripeEvent {
    complete: boolean;
    elementType: string;
    empty: boolean;
}

declare type StripeEventType = StripeShippingEvent | StripeCustomerEvent | StripePaymentEvent | StripeLinkV2Event;

declare enum StripeFormMode {
    SHIPPING = "shipping",
    BILLING = "billing"
}

declare interface StripeHostWindow extends Window {
    bcStripeClient?: StripeClient;
    bcStripeElements?: StripeElements;
    Stripe?<T = StripeClient>(stripePublishableKey: string, options?: StripeConfigurationOptions): T;
}

declare interface StripeInitializationData {
    stripePublishableKey: string;
    stripeConnectedAccount: string;
    shopperLanguage: string;
    customerSessionToken?: string;
    enableLink?: boolean;
    allowRedisplayForStoredInstruments?: boolean;
}

declare enum StripeInstrumentSetupFutureUsage {
    ON_SESSION = "on_session",
    OFF_SESSION = "off_session"
}

declare class StripeIntegrationService {
    private paymentIntegrationService;
    private scriptLoader;
    private isMounted;
    private checkoutEventsUnsubscribe?;
    constructor(paymentIntegrationService: PaymentIntegrationService, scriptLoader: StripeScriptLoader);
    deinitialize(): void;
    initCheckoutEventsSubscription(gatewayId: string, methodId: string, stripeInitializationOptions: StripeUPEPaymentInitializeOptions | StripeOCSPaymentInitializeOptions, stripeElements?: StripeElements): void;
    mountElement(stripeElement: StripeElement, containerId: string): void;
    mapAppearanceVariables(styles: NonNullable<StripeUPEPaymentInitializeOptions['style']>): {
        colorPrimary: import("./stripe").StripeAppearanceValues;
        colorBackground: import("./stripe").StripeAppearanceValues;
        colorText: import("./stripe").StripeAppearanceValues;
        colorDanger: import("./stripe").StripeAppearanceValues;
        colorTextSecondary: import("./stripe").StripeAppearanceValues;
        colorTextPlaceholder: import("./stripe").StripeAppearanceValues;
        colorIcon: import("./stripe").StripeAppearanceValues;
    };
    mapInputAppearanceRules(styles: NonNullable<StripeUPEPaymentInitializeOptions['style']>): {
        borderColor: import("./stripe").StripeAppearanceValues;
        color: import("./stripe").StripeAppearanceValues;
        boxShadow: import("./stripe").StripeAppearanceValues;
    };
    throwStripeError(stripeError?: unknown): never;
    throwDisplayableStripeError(stripeError: StripeError): void;
    isCancellationError(stripeError?: StripeError): boolean;
    throwPaymentConfirmationProceedMessage(): void;
    isPaymentCompleted(methodId: string, stripeUPEClient?: StripeClient): Promise<boolean>;
    mapStripePaymentData(stripeElements?: StripeElements, returnUrl?: string, shouldAllowRedisplay?: boolean): StripeConfirmPaymentData;
    isAdditionalActionError(errors: Array<{
        code: string;
    }>): boolean;
    isRedirectAction(additionalAction: StripeAdditionalActionRequired): boolean;
    isOnPageAdditionalAction(additionalAction: StripeAdditionalActionRequired): boolean;
    updateStripePaymentIntent(gatewayId: string, methodId: string): Promise<void>;
    private _mapStripeAddress;
}

declare interface StripeLayoutOptions {
    type?: 'accordion' | 'tabs';
    linkInAccordion?: boolean;
    defaultCollapsed?: boolean;
    radios?: boolean;
    spacedAccordionItems?: boolean;
    visibleAccordionItemsCount?: number;
}

declare class StripeLinkV2CustomerStrategy implements CustomerStrategy {
    private paymentIntegrationService;
    private scriptLoader;
    private stripeIntegrationService;
    private loadingIndicator;
    private _stripeClient?;
    private _stripeElements?;
    private _linkV2Element?;
    private _amountTransformer?;
    private _onComplete?;
    private _loadingIndicatorContainer?;
    private _currencyCode?;
    constructor(paymentIntegrationService: PaymentIntegrationService, scriptLoader: StripeScriptLoader, stripeIntegrationService: StripeIntegrationService, loadingIndicator: LoadingIndicator);
    initialize(options: CustomerInitializeOptions & WithStripeOCSCustomerInitializeOptions): Promise<void>;
    signIn(): Promise<void>;
    signOut(): Promise<void>;
    executePaymentMethodCheckout(): Promise<void>;
    deinitialize(): Promise<void>;
    private _mountExpressCheckoutElement;
    /** Events * */
    private _initializeEvents;
    private _onShippingAddressChange;
    private _onCancel;
    private _onShippingRateChange;
    /** Confirm methods * */
    private _onConfirm;
    private _updateShippingAndBillingAddress;
    private _mapShippingAddress;
    private _mapBillingAddress;
    private _processAdditionalAction;
    private _confirmStripePaymentOrThrow;
    private _completeCheckoutFlow;
    private _getPaymentPayload;
    /** Utils * */
    private _shouldRequireShippingAddress;
    private _updateDisplayedPrice;
    private _getCurrency;
    private _getTotalPrice;
    private _getAvailableCountries;
    private _getAvailableShippingOptions;
    private _getStripeShippingOption;
    private _handleShippingOptionChange;
    private _getAmountTransformer;
    private _toCents;
    private _toggleLoadingIndicator;
}

declare interface StripeLinkV2Event {
    value?: null;
    billingDetails?: {
        name?: string;
        email?: string;
        phone?: string;
        address?: {
            line1?: string;
            city?: string;
            country?: string;
            postal_code?: string;
            state?: string;
        };
    };
    shippingAddress?: {
        name?: string;
        address?: {
            line1?: string;
            line2?: string;
            city?: string;
            country?: string;
            postal_code?: string;
            state?: string;
        };
    };
    address?: {
        line1?: string;
        city?: string;
        country?: string;
        postal_code?: string;
        state?: string;
    };
    shippingRate?: StripeLinkV2ShippingRate;
    elementType: string;
    expressPaymentType: string;
    resolve(data: StripeLinkV2EventResolveData): void;
}

declare interface StripeLinkV2EventResolveData {
    lineItems?: LineItem[];
    allowedShippingCountries?: string[];
    shippingAddressRequired?: boolean;
    shippingRates?: StripeLinkV2ShippingRate[];
    billingAddressRequired?: boolean;
    emailRequired?: boolean;
    phoneNumberRequired?: boolean;
}

declare interface StripeLinkV2ShippingRate {
    id: string;
    amount: number;
    displayName: string;
}

declare interface StripeOCSCustomerInitializeOptions {
    buttonHeight?: number;
    /**
     * The ID of a container which the stripe iframe should be inserted.
     */
    container: string;
    /**
     * The identifier of the payment method.
     */
    methodId: string;
    gatewayId: string;
    onComplete?: (orderId?: number) => Promise<never>;
    loadingContainerId?: string;
}

/**
 * A set of options that are required to initialize the Stripe payment method.
 *
 * Once Stripe payment is initialized, credit card form fields, provided by the
 * payment provider as iframes, will be inserted into the current page. These
 * options provide a location and styling for each of the form fields.
 *
 * ```html
 * <!-- This is where the credit card component will be inserted -->
 * <div id="container"></div>
 * ```
 *
 * ```js
 * service.initializePayment({
 *     gateway: 'stripeocs',
 *     id: 'optimized_checkout',
 *     stripeocs {
 *         containerId: 'container',
 *     },
 * });
 * ```
 */
declare interface StripeOCSPaymentInitializeOptions {
    /**
     * The location to insert the credit card number form field.
     */
    containerId: string;
    /**
     * Stripe OCS layout options
     */
    layout?: Record<string, string | number | boolean>;
    /**
     * Stripe OCS appearance options for styling the accordion.
     */
    appearance?: StripeAppearanceOptions;
    /**
     * Stripe OCS fonts options for styling the accordion.
     */
    fonts?: StripeCustomFont[];
    onError?(error?: Error): void;
    render(): void;
    initStripeElementUpdateTrigger?(updateTriggerFn: (payload: StripeElementUpdateOptions) => void): void;
    paymentMethodSelect?(id: string): void;
    handleClosePaymentMethod?(collapseElement: () => void): void;
    togglePreloader?(showLoader: boolean): void;
}

declare class StripeOCSPaymentStrategy implements PaymentStrategy {
    private paymentIntegrationService;
    private scriptLoader;
    private stripeIntegrationService;
    private stripeClient?;
    private stripeElements?;
    private selectedMethodId?;
    constructor(paymentIntegrationService: PaymentIntegrationService, scriptLoader: StripeScriptLoader, stripeIntegrationService: StripeIntegrationService);
    initialize(options: PaymentInitializeOptions & WithStripeOCSPaymentInitializeOptions): Promise<void>;
    execute(orderRequest: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    finalize(): Promise<void>;
    deinitialize(): Promise<void>;
    private _initializeStripeElement;
    private _loadStripeJs;
    private _collapseStripeElement;
    private _getPaymentPayload;
    private _processAdditionalAction;
    private _confirmStripePaymentOrThrow;
    private _onStripeElementChange;
    private _shouldSaveInstrument;
    private _getTokenizedOptions;
}

declare interface StripePIPaymentMethodOptions {
    card?: StripePIPaymentMethodSavingOptions;
    us_bank_account?: StripePIPaymentMethodSavingOptions;
}

declare interface StripePIPaymentMethodSavingOptions {
    setup_future_usage?: StripeInstrumentSetupFutureUsage;
    verification_method?: string;
}

declare interface StripePaymentEvent extends StripeEvent {
    value: {
        type: StripePaymentMethodType;
    };
    collapsed?: boolean;
}

declare enum StripePaymentMethodType {
    CreditCard = "card",
    Link = "link",
    EPS = "eps",
    GRABPAY = "grabpay",
    BANCONTACT = "bancontact",
    IDEAL = "ideal",
    ALIPAY = "alipay",
    KLARNA = "klarna",
    OCS = "optimized_checkout"
}

declare interface StripeResult {
    paymentIntent?: PaymentIntent;
    error?: StripeError;
}

declare interface StripeSavePaymentMethod {
    maxVisiblePaymentMethods?: number;
}

declare class StripeScriptLoader {
    private scriptLoader;
    private stripeWindow;
    constructor(scriptLoader: ScriptLoader, stripeWindow?: StripeHostWindow);
    getStripeClient(initializationData: StripeInitializationData, betas?: string[], apiVersion?: string): Promise<StripeClient>;
    getElements(stripeClient: StripeClient, options: StripeElementsOptions): Promise<StripeElements>;
    updateStripeElements(options: StripeElementsOptions): Promise<void>;
    private load;
}

declare interface StripeShippingEvent extends StripeEvent {
    mode?: string;
    isNewAddress?: boolean;
    phoneFieldRequired: boolean;
    value: {
        address: Address;
        name?: string;
        firstName?: string;
        lastName?: string;
        phone?: string;
    };
    fields?: {
        phone: string;
    };
    display?: {
        name: string;
    };
}

declare enum StripeStringConstants {
    NEVER = "never",
    AUTO = "auto",
    ALWAYS = "always",
    PAYMENT = "payment",
    IF_REQUIRED = "if_required"
}

declare interface StripeUPECustomerInitializeOptions {
    /**
     * The ID of a container which the stripe iframe should be inserted.
     */
    container: string;
    /**
     * The identifier of the payment method.
     */
    methodId: string;
    /**
     * The identifier of the payment provider providing the payment method. This
     * option is only required if the provider offers multiple payment options.
     * i.e.: Stripeupe and Klarna.
     */
    gatewayId: string;
    /**
     * A callback that gets called whenever the Stripe Link Authentication Element's value changes.
     *
     * @param authenticated - if the email is authenticated on Stripe.
     * @param email - The new value of the email.
     */
    onEmailChange(authenticated: boolean, email: string): void;
    /**
     * A callback that gets called when Stripe Link Authentication Element is Loaded.
     */
    isLoading(mounted: boolean): void;
    /**
     * get styles from store theme
     */
    getStyles?(): {
        [key: string]: string;
    } | undefined;
}

declare class StripeUPECustomerStrategy implements CustomerStrategy {
    private paymentIntegrationService;
    private scriptLoader;
    private _stripeElements?;
    constructor(paymentIntegrationService: PaymentIntegrationService, scriptLoader: StripeScriptLoader);
    initialize(options: CustomerInitializeOptions & WithStripeUPECustomerInitializeOptions): Promise<void>;
    deinitialize(): Promise<void>;
    signIn(credentials: CustomerCredentials, options?: RequestOptions): Promise<void>;
    signOut(options?: RequestOptions): Promise<void>;
    executePaymentMethodCheckout(options?: ExecutePaymentMethodCheckoutOptions): Promise<void>;
}

/**
 * A set of options that are required to initialize the Stripe payment method.
 *
 * Once Stripe payment is initialized, credit card form fields, provided by the
 * payment provider as iframes, will be inserted into the current page. These
 * options provide a location and styling for each of the form fields.
 *
 * ```html
 * <!-- This is where the credit card component will be inserted -->
 * <div id="container"></div>
 * ```
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'stripeupe',
 *     stripeupe {
 *         containerId: 'container',
 *     },
 * });
 * ```
 */
declare interface StripeUPEPaymentInitializeOptions {
    /**
     * The location to insert the credit card number form field.
     */
    containerId: string;
    /**
     * Checkout styles from store theme
     */
    style?: Record<string, StripeAppearanceValues>;
    onError?(error?: Error): void;
    render(): void;
    initStripeElementUpdateTrigger?(updateTriggerFn: (payload: StripeElementUpdateOptions) => void): void;
}

declare class StripeUPEPaymentStrategy implements PaymentStrategy {
    private paymentIntegrationService;
    private scriptLoader;
    private stripeIntegrationService;
    private _stripeUPEClient?;
    private _stripeElements?;
    private _isStripeElementUpdateEnabled?;
    private _allowRedisplayForStoredInstruments?;
    constructor(paymentIntegrationService: PaymentIntegrationService, scriptLoader: StripeScriptLoader, stripeIntegrationService: StripeIntegrationService);
    initialize(options: PaymentInitializeOptions & WithStripeUPEPaymentInitializeOptions): Promise<void>;
    execute(orderRequest: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    finalize(): Promise<void>;
    deinitialize(): Promise<void>;
    private _executeWithStripeConfirmation;
    private _executeWithVaulted;
    private _loadStripeElement;
    private _processAdditionalActionWithStripeConfirmation;
    private _confirmStripePaymentOrThrow;
    private _processVaultedAdditionalAction;
    private _loadStripeJs;
    private _getPaymentPayload;
    private _updateStripeElement;
    private _getStripeElementTerms;
    private _updateStripeLinkStateByElementType;
}

declare interface StripeUpdateElementsOptions {
    /**
     * A [locale](https://stripe.com/docs/js/appendix/supported_locales) to display placeholders and
     * error strings in. Default is auto (Stripe detects the locale of the browser).
     * Setting the locale does not affect the behavior of postal code validation—a valid postal code
     * for the billing country of the card is still required.
     */
    locale?: string;
    /**
     * Match the design of your site with the appearance option.
     * The layout of each Element stays consistent, but you can modify colors, fonts, borders, padding, and more.
     */
    appearance?: StripeAppearanceOptions;
    mode?: string;
    amount?: number;
    currency?: string;
}

declare interface TermOptions {
    card?: AutoOrNever;
}

declare interface WalletOptions {
    applePay?: AutoOrNever;
    googlePay?: AutoOrNever;
    link?: AutoOrNever;
}

declare interface WithStripeOCSCustomerInitializeOptions {
    stripeocs?: StripeOCSCustomerInitializeOptions;
}

declare interface WithStripeOCSPaymentInitializeOptions {
    stripeocs?: StripeOCSPaymentInitializeOptions;
}

declare interface WithStripeUPECustomerInitializeOptions {
    /**
     * The options that are required to initialize the customer step of checkout
     * when using StripeUPE.
     */
    stripeupe?: StripeUPECustomerInitializeOptions;
}

declare interface WithStripeUPEPaymentInitializeOptions {
    stripeupe?: StripeUPEPaymentInitializeOptions;
}

export declare const createStripeLinkV2CustomerStrategy: import("../../../payment-integration-api/src/resolvable-module").default<CustomerStrategyFactory<StripeLinkV2CustomerStrategy>, {
    id: string;
}>;

export declare const createStripeOCSPaymentStrategy: import("../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<StripeOCSPaymentStrategy>, {
    gateway: string;
    id: string;
}>;

export declare const createStripeUPECustomerStrategy: import("../../../payment-integration-api/src/resolvable-module").default<CustomerStrategyFactory<StripeUPECustomerStrategy>, {
    id: string;
}>;

export declare const createStripeUPEPaymentStrategy: import("../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<StripeUPEPaymentStrategy>, {
    gateway: string;
    id?: undefined;
} | {
    gateway: string;
    id: string;
}>;

export declare const createStripeV3PaymentStrategy: import("../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<any>, {
    gateway: string;
}>;

declare interface validationElement {
    phone?: validationRequiredElement;
}

declare interface validationRequiredElement {
    required?: string;
}
