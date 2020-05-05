/**
 * CSS properties supported by Stripe.js.
 */
interface StripeElementCSSProperties {
    /**
     * The [background-color](https://developer.mozilla.org/en-US/docs/Web/CSS/background-color) CSS property.
     *
     * This property works best with the `::selection` pseudo-class.
     * In other cases, consider setting the background color on the element's container instaed.
     */
    backgroundColor?: string;

    /**
     * The [color](https://developer.mozilla.org/en-US/docs/Web/CSS/color) CSS property.
     */
    color?: string;

    /**
     * The [font-family](https://developer.mozilla.org/en-US/docs/Web/CSS/font-family) CSS property.
     */
    fontFamily?: string;

    /**
     * The [font-size](https://developer.mozilla.org/en-US/docs/Web/CSS/font-size) CSS property.
     */
    fontSize?: string;

    /**
     * The [font-smoothing](https://developer.mozilla.org/en-US/docs/Web/CSS/font-smoothing) CSS property.
     */
    fontSmoothing?: string;

    /**
     * The [font-style](https://developer.mozilla.org/en-US/docs/Web/CSS/font-style) CSS property.
     */
    fontStyle?: string;

    /**
     * The [font-variant](https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant) CSS property.
     */
    fontVariant?: string;

    /**
     * The [font-weight](https://developer.mozilla.org/en-US/docs/Web/CSS/font-weight) CSS property.
     */
    fontWeight?: string;

    /**
     * A custom property, used to set the color of the icons that are rendered in an element.
     */
    iconColor?: string;

    /**
     * The [line-height](https://developer.mozilla.org/en-US/docs/Web/CSS/line-height) CSS property.
     *
     * To avoid cursors being rendered inconsistently across browsers, consider using a padding on the element's container instead.
     */
    lineHeight?: string;

    /**
     * The [letter-spacing](https://developer.mozilla.org/en-US/docs/Web/CSS/letter-spacing) CSS property.
     */
    letterSpacing?: string;

    /**
     * The [text-align](https://developer.mozilla.org/en-US/docs/Web/CSS/text-align) CSS property.
     *
     * Available for the `cardNumber`, `cardExpiry`, and `cardCvc` elements.
     */
    textAlign?: string;

    /**
     * The [padding](https://developer.mozilla.org/en-US/docs/Web/CSS/padding) CSS property.
     *
     * Available for the `idealBank` element.
     * Accepts integer `px` values.
     */
    padding?: string;

    /**
     * The [text-decoration](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration) CSS property.
     */
    textDecoration?: string;

    /**
     * The [text-shadow](https://developer.mozilla.org/en-US/docs/Web/CSS/text-shadow) CSS property.
     */
    textShadow?: string;

    /**
     * The [text-transform](https://developer.mozilla.org/en-US/docs/Web/CSS/text-transform) CSS property.
     */
    textTransform?: string;
}

interface StripeElementStyleVariant extends StripeElementCSSProperties {
    ':hover'?: StripeElementCSSProperties;

    ':focus'?: StripeElementCSSProperties;

    '::placeholder'?: StripeElementCSSProperties;

    '::selection'?: StripeElementCSSProperties;

    ':-webkit-autofill'?: StripeElementCSSProperties;

    /**
     * Available for all elements except the `paymentRequestButton` element
     */
    ':disabled'?: StripeElementCSSProperties;

    /**
     * Available for the `cardNumber`, `cardExpiry`, and `cardCvc` elements.
     */
    '::-ms-clear'?: StripeElementCSSProperties & {display: string};
}

export type StripeElementType = 'card' | 'idealBank';

/**
 * Customize the appearance of an element using CSS properties passed in a `Style` object,
 * which consists of CSS properties nested under objects for each variant.
 */
export interface StripeElementStyle {
    /**
     * Base variant—all other variants inherit from these styles.
     */
    base?: StripeElementStyleVariant;

    /**
     * Applied when the element has valid input.
     */
    complete?: StripeElementStyleVariant;

    /**
     * Applied when the element has no customer input.
     */
    empty?: StripeElementStyleVariant;

    /**
     * Applied when the element has invalid input.
     */
    invalid?: StripeElementStyleVariant;
}

export interface StripeElementOptions {
    style?: StripeElementStyle;
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
     * Creates a `CardElement` | `IdealBankElement`.
     */
    create(
        elementType: StripeElementType,
        options?: StripeElementOptions
    ): StripeElement;

    /**
     * Looks up a previously created `Element` by its type.
     */
    getElement(elementType: StripeElementType): StripeElement | null;
}

interface AccountAddressParam {
    /**
     * City, district, suburb, town, or village.
     */
    city?: string;

    /**
     * Two-letter country code ([ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2)).
     */
    country?: string;

    /**
     * Address line 1 (e.g., street, PO Box, or company name).
     */
    line1?: string;

    /**
     * Address line 2 (e.g., apartment, suite, unit, or building).
     */
    line2?: string;

    /**
     * ZIP or postal code.
     */
    postal_code?: string;

    /**
     * State, county, province, or region.
     */
    state?: string;
}

interface AddressParam extends AccountAddressParam {
    /**
     * Address line 1 (e.g., street, PO Box, or company name).
     */
    line1: string;
}

export interface Shipping {
    /**
     * Shipping address.
     */
    address: AddressParam;

    /**
     * Recipient name.
     */
    name: string;

    /**
     * Recipient phone (including extension).
     */
    phone?: string;
}

export interface PaymentIntentConfirmParams {
    /**
     * Indicates that you intend to make future payments with this PaymentIntent's payment method.
     *
     * If present, the payment method used with this PaymentIntent can be [attached](https://stripe.com/docs/api/payment_methods/attach) to a Customer, even after the transaction completes.
     *
     * Use `on_session` if you intend to only reuse the payment method when your customer is present in your checkout flow. Use `off_session` if your customer may or may not be in your checkout flow.
     */
    setup_future_usage?: 'off_session' | 'on_session' | null;

    /**
     * Shipping information for this PaymentIntent.
     */
    shipping?: Shipping | null;
}

interface Address {
    /**
     * City, district, suburb, town, or village.
     */
    city?: string;

    /**
     * Two-letter country code ([ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2)).
     */
    country?: string;

    /**
     * Address line 1 (e.g., street, PO Box, or company name).
     */
    line1?: string;

    /**
     * Address line 2 (e.g., apartment, suite, unit, or building).
     */
    line2?: string;

    /**
     * ZIP or postal code.
     */
    postal_code?: string;

    /**
     * State, county, province, or region.
     */
    state?: string;
}

export interface BillingDetails {
    /**
     * Billing address.
     */
    address?: Address;

    /**
     * Email address.
     */
    email?: string;

    /**
     * Full name.
     */
    name?: string;

    /**
     * Billing phone number (including extension).
     */
    phone?: string;
}

export interface PaymentMethodCreateParams {
    /**
     * Billing information associated with the PaymentMethod that may be used or required by particular types of payment methods.
     */
    billing_details?: BillingDetails;
}

interface CreatePaymentMethodCardData extends PaymentMethodCreateParams {
    card: StripeElement;
}

interface CreatePaymentMethodIdealData extends PaymentMethodCreateParams {
    ideal: StripeElement;
}

/**
 * Data to be sent with a `stripe.confirmCardPayment` request.
 * Refer to the [Payment Intents API](https://stripe.com/docs/api/payment_intents/confirm) for a full list of parameters.
 */
export interface ConfirmCardPaymentData extends PaymentIntentConfirmParams {
    /*
     * An object containing data to create a `PaymentMethod` with.
     * This field is optional if a `PaymentMethod` has already been attached to this `PaymentIntent`.
     *
     * @recommended
     */
    payment_method?: CreatePaymentMethodCardData;
}

  /**
   * Data to be sent with a `stripe.confirmIdealPayment` request.
   * Refer to the [Payment Intents API](https://stripe.com/docs/api/payment_intents/confirm) for a full list of parameters.
   */
export interface ConfirmIdealPaymentData extends PaymentIntentConfirmParams {
    /*
    * An object containing data to create a `PaymentMethod` with.
    * This field is optional if a `PaymentMethod` has already been attached to this `PaymentIntent`.
    *
    * @recommended
    */
    payment_method?: CreatePaymentMethodIdealData;

    /**
     * The url your customer will be directed to after they complete authentication.
     *
     * @recommended
     */
    return_url?: string;
}

/**
 * The PaymentIntent object.
 */
interface PaymentIntent {
    /**
     * Unique identifier for the object.
     */
    id: string;

    /**
     * Status of this PaymentIntent. Read more about each PaymentIntent [status](https://stripe.com/docs/payments/intents#intent-statuses).
     */
    status: 'succeeded' | string;
}

interface StripeError {
    /**
     * A human-readable message providing more details about the error. For card errors, these messages can be shown to your users.
     */
    message?: string;
}

export interface StripeV3Client {
    /**
     * Create an `Elements` instance, which manages a group of elements.
     */
    elements(): StripeElements;

    /**
     * Use `stripe.confirmCardPayment` when the customer submits your payment form.
     * When called, it will confirm the [PaymentIntent](https://stripe.com/docs/api/payment_intents) with `data` you provide and carry out 3DS or other next actions if they are required.
     *
     * @docs https://stripe.com/docs/js/payment_intents/confirm_card_payment
     */
    confirmCardPayment(
        clientSecret: string,
        data?: ConfirmCardPaymentData
    ): Promise<{paymentIntent?: PaymentIntent; error?: StripeError}>;

    /**
     * Use `stripe.confirmIdealPayment` in the [iDEAL Payments with Payment Methods](https://stripe.com/docs/payments/ideal) flow when the customer submits your payment form.
     * When called, it will confirm the `PaymentIntent` with `data` you provide, and it will automatically redirect the customer to the authorize the transaction.
     * Once authorization is complete, the customer will be redirected back to your specified `return_url`.
     *
     * @docs https://stripe.com/docs/js/payment_intents/confirm_ideal_payment
     */
    confirmIdealPayment(
        clientSecret: string,
        data?: ConfirmIdealPaymentData
      ): Promise<{paymentIntent?: PaymentIntent; error?: StripeError}>;
}

export interface StripeV3JsOptions {
    betas: string[];
    stripeAccount: string;
}

export interface StripeHostWindow extends Window {
    Stripe?(
        stripePublishableKey: string,
        options: StripeV3JsOptions
    ): StripeV3Client;
}
