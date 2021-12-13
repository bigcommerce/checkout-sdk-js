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
    redirect?: 'always' | 'if_required';
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
}

export interface StripeElements {
    /**
     * Creates a `payment` element.
     */
    create(elementType: 'payment'): StripeElement;

    /**
     * Looks up a previously created `payment` element.
     */
    getElement(elementType: 'payment'): StripeElement | null;
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
}

export interface StripeUPEClient {
    /**
     * When called, confirmPayment will attempt to complete any required actions,
     * such as authenticating your user by displaying a 3DS dialog or redirecting them to a bank authorization page.
     */
    confirmPayment(options: StripeConfirmPaymentData): Promise<{paymentIntent?: PaymentIntent; error?: StripeError}>;

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
}

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
