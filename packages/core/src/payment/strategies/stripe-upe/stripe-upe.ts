import { CustomFont, PaymentIntent, StripeConfigurationOptions, StripeElement } from '../stripev3';

export { StripeAdditionalAction, StripeElement } from '../stripev3';

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

/**
 * Object definition for part of the data sent to confirm the PaymentIntent.
 */
export interface AddressOptions {
    city?: string;
    country?: string;
    state?: string;
    postal_code?: string;
    line1?: string;
    line2?: string;
}

/**
 * Object definition for part of the data sent to confirm the PaymentIntent.
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
    /**
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
}

export interface WalletOptions {
    applePay?: AutoOrNever;
    googlePay?: AutoOrNever;
}

/**
 * All available options are here https://stripe.com/docs/js/elements_object/create_payment_element
 */
export interface StripeElementsCreateOptions {
    fields?: FieldsOptions;
    wallets?: WalletOptions;
}

export interface StripeElements {
    /**
     * Creates a `payment` element.
     */
    create(elementType: StripeStringConstants.PAYMENT, options?: StripeElementsCreateOptions): StripeElement;

    /**
     * Looks up a previously created `payment` element.
     */
    getElement(elementType: StripeStringConstants.PAYMENT): StripeElement | null;
}

/**
 * All available options are here https://stripe.com/docs/stripe-js/appearance-api#supported-css-properties
 */
export interface StripeUPEAppearanceOptions {
    variables?: {
        colorPrimary?: string;
        colorBackground?: string;
        colorText?: string;
        colorDanger?: string;
        colorTextSecondary?: string;
        colorTextPlaceholder?: string;
        colorIcon?: string;
        colorIconCardError?: string;
        colorIconRedirect?: string;
    };

    rules?: {
        '.Input'?: {
            borderColor?: string;
            color?: string;
            boxShadow?: string;
        };
    };
}

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
    clientSecret: string;

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
    confirmPayment(options: StripeConfirmPaymentData): Promise<{paymentIntent?: PaymentIntent; error?: StripeError}>;

    /**
     * When called, it will confirm the PaymentIntent with data you provide and carry out 3DS or other next actions if they are required.
     */
     confirmCardPayment(clientSecret: string): Promise<{paymentIntent?: PaymentIntent; error?: StripeError}>;

    /**
     * Create an `Elements` instance, which manages a group of elements.
     */
    elements(options: StripeElementsOptions): StripeElements;
}

export interface StripeHostWindow extends Window {
    Stripe?(
        stripePublishableKey: string,
        options?: StripeConfigurationOptions
    ): StripeUPEClient;
}

export enum StripePaymentMethodType {
    CreditCard = 'card',
    SOFORT = 'sofort',
    EPS = 'eps',
    GRABPAY = 'grabpay',
    BANCONTACT = 'bancontact',
    IDEAL = 'ideal',
    GIROPAY = 'giropay',
    ALIPAY = 'alipay',
}

type AutoOrNever = StripeStringConstants.AUTO | StripeStringConstants.NEVER;

export enum StripeStringConstants {
    NEVER = 'never',
    AUTO = 'auto',
    ALWAYS = 'always',
    PAYMENT = 'payment',
    IF_REQUIRED = 'if_required',
}
