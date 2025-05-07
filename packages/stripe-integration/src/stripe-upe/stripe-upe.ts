/**
 * Initialization options.
 */
export interface StripeConfigurationOptions {
    /**
     * For usage with [Connect](https://stripe.com/docs/connect) only.
     * Specifying a connected account ID (e.g., acct_24BFMpJ1svR5A89k) allows you to perform actions on behalf of that account.
     */
    stripeAccount: string;

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

export interface StripeAdditionalActionData {
    redirect_url?: string;
    intent?: string;
}

export interface StripeAdditionalAction {
    type: string;
    data: StripeAdditionalActionData;
}

/**
 * The PaymentIntent object.
 */
export interface PaymentIntent {
    /**
     * Unique identifier for the object.
     */
    id: string;

    /**
     * Status of this PaymentIntent. Read more about each PaymentIntent [status](https://stripe.com/docs/payments/intents#intent-statuses).
     */
    status: 'succeeded' | string;

    /**
     * The payment error encountered in the previous PaymentIntent confirmation. It will be cleared if the PaymentIntent is later updated for any reason.
     */
    last_payment_error: LastPaymentError | null;
}

/**
 * The payment error encountered in the previous PaymentIntent confirmation. It will be cleared if the PaymentIntent is later updated for any reason.
 */
export interface LastPaymentError {
    /**
     * A human-readable message providing more details about the error. For card errors, these messages can be shown to your users.
     */
    message?: string;
}

/**
 * The PaymentMethod object
 */
export interface PaymentMethod {
    /**
     * Unique identifier for the object.
     */
    id: string;

    /**
     * The type of the PaymentMethod. An additional hash is included on the PaymentMethod with a name matching this value.
     * It contains additional information specific to the PaymentMethod type.
     */
    type: string;
}

/**
 * This object is used to pass custom fonts when creating an [Elements](https://stripe.com/docs/js/elements_object/create) object.
 */
export interface CssFontSource {
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
export interface CustomFontSource {
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

export type CustomFont = CssFontSource | CustomFontSource;

export interface StripeError {
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

export interface StripeElement {
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
    on(event: 'change' | 'ready', handler: (event: StripeEventType) => void): void;

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

export interface StripeEvent {
    complete: boolean;
    elementType: string;
    empty: boolean;
}

export interface StripeCustomerEvent extends StripeEvent {
    collapsed?: boolean;
    authenticated: boolean;
    value: {
        email: string;
    };
}

export interface StripeShippingEvent extends StripeEvent {
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

export interface StripePaymentEvent extends StripeEvent {
    value: {
        type: StripePaymentMethodType;
    };
    collapsed?: boolean;
}

interface Address {
    city: string;
    country: string;
    line1: string;
    line2?: string;
    postal_code: string;
    state: string;
}

export type StripeEventType = StripeShippingEvent | StripeCustomerEvent | StripePaymentEvent;

/**
 * Object definition for part of the data sent to confirm the PaymentIntent.
 * https://stripe.com/docs/api/payment_intents/confirm#confirm_payment_intent-shipping
 */
export type AddressOptions = Partial<Address>;

/**
 * Object definition for part of the data sent to confirm the PaymentIntent.
 * https://stripe.com/docs/js/elements_object/create_payment_element
 */
export interface AddressProperties {
    city?: AutoOrNever;
    country?: AutoOrNever;
    state?: AutoOrNever;
    postalCode?: AutoOrNever;
    line1?: AutoOrNever;
    line2?: AutoOrNever;
}

/**
 * Object definition for part of the data sent to confirm the PaymentIntent.
 */
export interface BillingDetailsOptions {
    name?: string;
    email?: string;
    address?: AddressOptions;
    phone?: string;
}

/**
 * Object definition for part of the data sent to confirm the PaymentIntent.
 */
export interface BillingDetailsProperties {
    name?: AutoOrNever;
    email?: AutoOrNever;
    address?: AutoOrNever | AddressProperties;
    phone?: AutoOrNever;
}

/**
 * Object definition for part of the data sent to confirm the PaymentIntent.
 */
export interface PaymentMethodDataOptions {
    billing_details: BillingDetailsOptions;
}

/**
 * Parameters that will be passed on to the Stripe API to confirm the PaymentIntent.
 */
export interface StripeUPEConfirmParams {
    /*
     * If you are [handling next actions yourself](https://stripe.com/docs/payments/payment-intents/verifying-status#next-actions), pass in a return_url. If the subsequent action
     * is redirect_to_url, this URL will be used on the return path for the redirect.
     *
     * @recommended
     */
    return_url?: string;
    payment_method_data?: PaymentMethodDataOptions;
}

/**
 * Data to be sent with a `stripe.confirmPayment` request.
 * Refer to the [Payment Intents API](https://stripe.com/docs/js/payment_intents/confirm_payment) for a full list of parameters.
 */
export interface StripeConfirmPaymentData {
    /**
     * The Elements instance that was used to create the Payment Element.
     */
    elements: StripeElements;

    /**
     * Parameters that will be passed on to the Stripe API to confirm the PaymentIntent.
     */
    confirmParams?: StripeUPEConfirmParams;

    /**
     * By default, confirmPayment will always redirect to your return_url after a successful confirmation.
     * If you set redirect: "if_required", then confirmPayment will only redirect if your user chooses a redirect-based payment method.
     */
    redirect?: StripeStringConstants.ALWAYS | StripeStringConstants.IF_REQUIRED;
}

export interface FieldsOptions {
    billingDetails?: AutoOrNever | BillingDetailsProperties;
    phone?: string;
}

export interface WalletOptions {
    applePay?: AutoOrNever;
    googlePay?: AutoOrNever;
}

export interface TermOptions {
    card?: AutoOrNever;
}

export interface StripeLayoutOptions {
    type?: 'accordion' | 'tabs';
    defaultCollapsed?: boolean;
    radios?: boolean;
    spacedAccordionItems?: boolean;
    visibleAccordionItemsCount?: number;
}

/**
 * All available options are here https://stripe.com/docs/js/elements_object/create_payment_element
 */
export interface StripeElementsCreateOptions {
    mode?: string;
    fields?: FieldsOptions;
    wallets?: WalletOptions;
    allowedCountries?: string[];
    defaultValues?: ShippingDefaultValues | CustomerDefaultValues;
    validation?: validationElement;
    display?: { name: DisplayName };
    terms?: TermOptions;
    layout?: StripeLayoutOptions;
    paymentMethodOrder?: string[];
}

interface validationElement {
    phone?: validationRequiredElement;
}

interface validationRequiredElement {
    required?: string;
}

interface ShippingDefaultValues {
    name?: string;
    firstName?: string;
    lastName?: string;
    phone: string;
    address: Address;
}

/*
Decide which mode you are going to use the Address Element
Shipping: is used with the Payment Element and Link Authentication Element, it will automatically pass shipping
information when confirming Payment Intent or Setup Intent.
Billing: is used with the Payment Element, it will automatically pass the billing information when confirming
Payment Intent or Setup Intent.
 */
export enum StripeFormMode {
    SHIPPING = 'shipping',
    BILLING = 'billing',
}

export enum DisplayName {
    SPLIT = 'split',
    FULL = 'full',
    ORGANIZATION = 'organization',
}

interface CustomerDefaultValues {
    mode: StripeFormMode;
    email: string;
    allowedCountries?: string[];
    display?: {
        name: DisplayName;
    };
}

export interface StripeElements {
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
 * All available options are here https://stripe.com/docs/stripe-js/appearance-api#supported-css-properties
 */
export interface StripeUPEAppearanceOptions {
    variables?: Record<string, StripeUPEAppearanceValues>;

    rules?: Record<string, Record<string, StripeUPEAppearanceValues>>;
}

export type StripeUPEAppearanceValues = string | string[] | number | undefined;

export interface StripeElementsOptions {
    /**
     * An array of custom fonts, which elements created from the Elements object can use.
     * Fonts can be specified as [CssFontSource](https://stripe.com/docs/js/appendix/css_font_source_object)
     * or [CustomFontSource](https://stripe.com/docs/js/appendix/custom_font_source_object) objects.
     */
    fonts?: CustomFont[];

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
     * Match the design of your site with the appearance option.
     * The layout of each Element stays consistent, but you can modify colors, fonts, borders, padding, and more.
     */
    appearance?: StripeUPEAppearanceOptions;

    mode?: string;
    amount?: number;
    currency?: string;
    paymentMethodTypes?: string[];
}

export interface StripeUpdateElementsOptions {
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
    appearance?: StripeUPEAppearanceOptions;
}

export interface StripeUPEClient {
    /**
     * Use confirmPayment to confirm a PaymentIntent using data collected by the Payment Element.
     * When called, confirmPayment will attempt to complete any required actions,
     * such as authenticating your user by displaying a 3DS dialog or redirecting them to a bank authorization page.
     */
    confirmPayment(options: StripeConfirmPaymentData): Promise<StripeUpeResult>;

    /**
     * When called, it will confirm the PaymentIntent with data you provide and carry out 3DS or other next actions if they are required.
     */
    confirmCardPayment(clientSecret: string): Promise<StripeUpeResult>;

    /**
     * Retrieve a PaymentIntent using its client secret.
     */
    retrievePaymentIntent(clientSecret: string): Promise<StripeUpeResult>;

    /**
     * Create an `Elements` instance, which manages a group of elements.
     */
    elements(options: StripeElementsOptions): StripeElements;
}

export interface StripeUpeResult {
    paymentIntent?: PaymentIntent;
    error?: StripeError;
}

export interface StripeHostWindow extends Window {
    bcStripeClient?: StripeUPEClient;
    bcStripeElements?: StripeElements;
    Stripe?(stripePublishableKey: string, options?: StripeConfigurationOptions): StripeUPEClient;
}

export enum StripePaymentMethodType {
    CreditCard = 'card',
    Link = 'link',
    SOFORT = 'sofort',
    EPS = 'eps',
    GRABPAY = 'grabpay',
    BANCONTACT = 'bancontact',
    IDEAL = 'ideal',
    GIROPAY = 'giropay',
    ALIPAY = 'alipay',
    KLARNA = 'klarna',
    OCS = 'stripe_ocs',
}

type AutoOrNever = StripeStringConstants.AUTO | StripeStringConstants.NEVER;

export enum StripeStringConstants {
    NEVER = 'never',
    AUTO = 'auto',
    ALWAYS = 'always',
    PAYMENT = 'payment',
    IF_REQUIRED = 'if_required',
}

export enum StripeElementType {
    PAYMENT = 'payment',
    AUTHENTICATION = 'linkAuthentication',
    SHIPPING = 'address',
}

export enum StripeUPEPaymentIntentStatus {
    REQUIRES_PAYMENT_METHOD = 'requires_payment_method',
    REQUIRES_CONFIRMATION = 'requires_confirmation',
    REQUIRES_ACTION = 'requires_action',
    PROCESSING = 'processing',
    SUCCEEDED = 'succeeded',
    CANCELED = 'canceled',
}

export interface StripeUPEPaymentMethod extends PaymentMethod {
    initializationData: StripeUPEInitializationData;
}

export interface StripeUPEInitializationData {
    stripePublishableKey: string;
    stripeConnectedAccount: string;
    shopperLanguage: string;
}

export interface StripeElementUpdateOptions {
    shouldShowTerms?: boolean;
}

export interface StripeAdditionalActionRequired {
    type: string;
    data: {
        token?: string;
        redirect_url?: string;
    };
}

export interface StripeAdditionalActionResponseBody {
    additional_action_required: StripeAdditionalActionRequired;
    three_ds_result: {
        token?: string;
    };
}
