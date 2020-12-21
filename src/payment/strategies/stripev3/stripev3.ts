interface BaseElementOptions {
    /**
     * Customize the appearance of an element using CSS properties passed in a [Style](https://stripe.com/docs/js/appendix/style) object,
     * which consists of CSS properties nested under objects for each variant.
     */
    style?: StripeElementStyle;

    /**
     * Set custom class names on the container DOM element when the Stripe element is in a particular state.
     */
    classes?: StripeElementClasses;

    /**
     * Applies a disabled state to the Element such that user input is not accepted. Default is false.
     */
    disabled?: boolean;
}

export interface CreatePaymentMethodCardData extends PaymentMethodCreateParams {
    card?: StripeElement;
}

export interface CreatePaymentMethodIdealData extends PaymentMethodCreateParams {
    ideal?: StripeElement;
}

export interface CreatePaymentMethodSepaData extends PaymentMethodCreateParams {
    sepa_debit?: StripeElement;
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

export interface PaymentMethodCreateParams {
    /**
     * Billing information associated with the PaymentMethod that may be used or required by particular types of payment methods.
     */
    billing_details?: StripeBillingDetails;
}

export interface StripeError {
    /**
     * A human-readable message providing more details about the error. For card errors, these messages can be shown to your users.
     */
    message?: string;
}

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

export interface CardElementOptions extends BaseElementOptions {
    /**
     * A pre-filled set of values to include in the input (e.g., {postalCode: '94110'}).
     * Note that sensitive card information (card number, CVC, and expiration date)
     * cannot be pre-filled
     */
    value?: string;

    /**
     * Hide the postal code field. Default is false. If you are already collecting a
     * full billing address or postal code elsewhere, set this to true.
     */
    hidePostalCode?: boolean;

    /**
     * Appearance of the icon in the Element.
     */
    iconStyle?: IconStyle;

    /*
     * Hides the icon in the Element, Default is false
     */
    hideIcon?: boolean;

}

interface BaseIndividualElementOptions extends BaseElementOptions  {
    containerId: string;
}

export interface CardNumberElementOptions extends BaseIndividualElementOptions {
    /*
     * Placeholder
     */
    placeholder?: string;

    showIcon?: boolean;
    /**
     * Appearance of the icon in the Element. Either `solid` or `default`
     */
    iconStyle?: IconStyle;
}

export interface CardExpiryElementOptions extends BaseIndividualElementOptions {
    /*
     * Placeholder
     */
    placeholder?: string;
}

export interface CardCvcElementOptions extends BaseIndividualElementOptions {
    /*
     * Placeholder
     */
    placeholder?: string;
}

export interface IbanElementOptions extends BaseElementOptions {
    /**
     * Specify the list of countries or country-groups whose IBANs you want to allow.
     * Must be ['SEPA'].
     */
    supportedCountries?: string[];

    /**
     * Customize the country and format of the placeholder IBAN. Default is DE.
     */
    placeholderCountry?: string;

    /**
     * Appearance of the icon in the Element.
     */
    iconStyle?: IconStyle;
}

export interface IdealElementOptions extends BaseElementOptions {
    value?: string;

    /**
     * Hides the icon in the Element. Default is false.
     */
    hideIcon?: boolean;
}

export interface ZipCodeElementOptions {
    containerId: string;
}

export enum IconStyle {
    Solid = 'solid',
    Default = 'default',
}

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

export interface StripeElementClasses {
    /**
     * The base class applied to the container. Defaults to StripeElement.
     */
    base?: string;

    /**
     * The class name to apply when the Element is complete. Defaults to StripeElement--complete.
     */
    complete?: string;

    /**
     * The class name to apply when the Element is empty. Defaults to StripeElement--empty.
     */
    empty?: string;

    /**
     * The class name to apply when the Element is focused. Defaults to StripeElement--focus.
     */
    focus?: string;

    /**
     * The class name to apply when the Element is invalid. Defaults to StripeElement--invalid.
     */
    invalid?: string;

    /**
     * The class name to apply when the Element has its value autofilled by the browser
     * (only on Chrome and Safari). Defaults to StripeElement--webkit-autofill.
     */
    webkitAutoFill?: string;
}

export interface StripeAddress {
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
    line1: string;

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

export interface StripeBillingDetails {
    /**
     * Billing address.
     */
    address?: StripeAddress;

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

export interface StripeShippingAddress {
    /**
     * Shipping Address
     */
    address: StripeAddress;

    /**
     * Recipient name
     */
    name: string;

    /**
     * The delivery service that shipped a physical product, such as Fedex, UPS, USPS, etc.
     */
    carrier?: string;

    /**
     * Recipient phone (including extension).
     */
    phone?: string;

    /**
     * The tracking number for a physical product, obtained from the delivery service.
     * If multiple tracking numbers were generated for this purchase, please separate them with commas.
     */
    tracking_number?: string;
}

/**
 * Data to be sent with a `stripe.confirmAlipayPayment` request.
 * Refer to the [Payment Intents API](https://stripe.com/docs/api/payment_intents/confirm) for a full list of parameters.
 */
export interface StripeConfirmAlipayPaymentData {
    /**
     * If you are [handling next actions yourself](https://stripe.com/docs/payments/payment-intents/verifying-status#next-actions), pass in a return_url. If the subsequent action
     * is redirect_to_url, this URL will be used on the return path for the redirect.
     *
     * @recommended
     */
    return_url?: string;
}

/**
 * Data to be sent with a `stripe.confirmCardPayment` request.
 * Refer to the [Payment Intents API](https://stripe.com/docs/api/payment_intents/confirm) for a full list of parameters.
 */
export interface StripeConfirmCardPaymentData {
    /*
     * Either the id of an existing [PaymentMethod](https://stripe.com/docs/api/payment_methods), or an object containing data to create a
     * PaymentMethod with. See the use case sections below for details.
     *
     * @recommended
     */
    payment_method?: CreatePaymentMethodCardData;

    /**
     * The [shipping details](https://stripe.com/docs/api/payment_intents/confirm#confirm_payment_intent-shipping) for the payment, if collected.
     *
     * @recommended
     */
    shipping?: StripeShippingAddress;

    /**
     * If you are [handling next actions yourself](https://stripe.com/docs/payments/payment-intents/verifying-status#next-actions), pass in a return_url. If the subsequent action
     * is redirect_to_url, this URL will be used on the return path for the redirect.
     *
     * @recommended
     */
    return_url?: string;

    /**
     * Indicates that you intend to make future payments with this PaymentIntent's payment method.
     *
     * If present, the payment method used with this PaymentIntent can be [attached](https://stripe.com/docs/api/payment_methods/attach) to a Customer, even after the transaction completes.
     *
     * Use `on_session` if you intend to only reuse the payment method when your customer is present in your checkout flow. Use `off_session` if your customer may or may not be in your checkout flow.
     */
    setup_future_usage?: 'off_session' | 'on_session' | null;
}

/**
 * Data to be sent with a `stripe.confirmIdealPayment` request.
 * Refer to the [Payment Intents API](https://stripe.com/docs/api/payment_intents/confirm) for a full list of parameters.
 */
export interface StripeConfirmIdealPaymentData {
    /*
     * Either the id of an existing [PaymentMethod](https://stripe.com/docs/api/payment_methods), or an object containing data to create a
     * PaymentMethod with. See the use case sections below for details.
     *
     * @recommended
     */
    payment_method?: CreatePaymentMethodIdealData;

    /**
     * If you are [handling next actions yourself](https://stripe.com/docs/payments/payment-intents/verifying-status#next-actions), pass in a return_url. If the subsequent action
     * is redirect_to_url, this URL will be used on the return path for the redirect.
     *
     * @recommended
     */
    return_url?: string;
}

/**
 * Data to be sent with a `stripe.confirmSEPAPayment` request.
 * Refer to the [Payment Intents API](https://stripe.com/docs/api/payment_intents/confirm) for a full list of parameters.
 */
export interface StripeConfirmSepaPaymentData {
    /*
     * Either the id of an existing [PaymentMethod](https://stripe.com/docs/api/payment_methods), or an object containing data to create a
     * PaymentMethod with. See the use case sections below for details.
     *
     * @recommended
     */
    payment_method?: CreatePaymentMethodSepaData;
}

export type StripeConfirmPaymentData = StripeConfirmAlipayPaymentData | StripeConfirmCardPaymentData | StripeConfirmIdealPaymentData | StripeConfirmSepaPaymentData | undefined;

export type StripeElementOptions = CardElementOptions | CardExpiryElementOptions | CardNumberElementOptions | CardCvcElementOptions | IdealElementOptions | IbanElementOptions | ZipCodeElementOptions;

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
     * Creates a `AlipayElement` | `CardElement` | `CardCvcElement` |`CardExpiryElement` | `CardExpiryElement` | `CardNumberElement` | `IdealBankElement` | `IbanElement`.
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
}

export interface StripeConfirmPaymentOptions {
    /**
     * Set this to false if you want to [manually handle the authorization redirect](https://stripe.com/docs/payments/ideal#handle-redirect). Default is true.
     */
    handleActions?: boolean;
}

export interface StripeV3Client {
    /**
     * Create an `Elements` instance, which manages a group of elements.
     */
    elements(options?: StripeElementsOptions): StripeElements;

    /**
     * @docs https://stripe.com/docs/js/payment_intents/confirm_alipay_payment
     *
     * Use `stripe.confirmAlipayPayment` in the Alipay payment method creation flow when the customer submits your payment form.
     * When called, it will confirm the [PaymentIntent](https://stripe.com/docs/api/payment_intents) with data you provide, and it will automatically
     * redirect the customer to the authorize the transaction. Once authorization is complete, the customer will be redirected
     * back to your specified `return_url`. When you confirm a `PaymentIntent`, it needs to have an attached [PaymentMethod](https://stripe.com/docs/api/payment_methods).
     * In addition to confirming the `PaymentIntent`, this method can automatically create and attach a new `PaymentMethod` for you.
     * If you have already attached a `PaymentMethod` you can call this method without needing to provide any additional data.
     * These use cases are detailed in the sections that follow.
     *
     * @returns
     * `stripe.confirmAlipayPayment` by default, will trigger a redirect when successful. If there is an error, or when handling
     * `next_actions` manually by using the `handleActions: false` option, it will return a `Promise` which resolves with a `result` object.
     * This object has either:
     *
     * - result.paymentIntent: the successful PaymentIntent.
     * - result.error: an error. Refer to the API reference for all possible errors.
     *
     * Note that `stripe.confirmAlipayPayment` may take several seconds to complete. During that time, you should disable your
     * form from being resubmitted and show a waiting indicator like a spinner. If you receive an error result, you should
     * be sure to show that error to the customer, re-enable the form, and hide the waiting indicator.
     */
    confirmAlipayPayment(
        /**
         * The [client secret](https://stripe.com/docs/api/payment_intents/object#payment_intent_object-client_secret) of the PaymentIntent.
         */
        clientSecret: string,

        /**
         * Data to be sent with the request. Refer to the Payment Intents API for a full list of parameters.
         */
        data?: StripeConfirmAlipayPaymentData,

        /**
         * An options object to control the behavior of this method.
         */
        options?: StripeConfirmPaymentOptions
    ): Promise<{paymentIntent?: PaymentIntent; error?: StripeError}>;

    /**
     * @docs https://stripe.com/docs/js/payment_intents/confirm_card_payment
     *
     * Use `stripe.confirmCardPayment` when the customer submits your payment form.
     * When called, it will confirm the [PaymentIntent](https://stripe.com/docs/api/payment_intents)
     * with `data` you provide and carry out 3DS or other next actions if they are required.
     *
     * If you are using [Dynamic 3D Secure](https://stripe.com/docs/payments/3d-secure#three-ds-radar), `stripe.confirmCardPayment` will
     * trigger your Radar rules to execute and may open a dialog for your customer to authenticate their payment.
     *
     * When you confirm a `PaymentIntent`, it needs to have an attached [PaymentMethod](https://stripe.com/docs/api/payment_methods).
     * In addition to confirming the `PaymentIntent`, this method can automatically create and attach a new `PaymentMethod` for you.
     * It can also be called with an existing `PaymentMethod`, or if you have already attached a PaymentMethod you can call this
     * method without needing to provide any additional data. These use cases are detailed in the sections that follow.
     *
     * @returns
     * `stripe.confirmCardPayment` will return a Promise which resolves with a result object.
     * This object has either:
     *
     * - result.paymentIntent: the successful PaymentIntent.
     * - result.error: an error. Refer to the API reference for all possible errors.
     *
     * Note that stripe.confirmCardPayment may take several seconds to complete. During that time, you should disable
     * your form from being resubmitted and show a waiting indicator like a spinner. If you receive an error result,
     * you should be sure to show that error to the customer, re-enable the form, and hide the waiting indicator.
     *
     * Additionally, `stripe.confirmCardPayment may trigger` a [3D Secure](https://stripe.com/docs/payments/3d-secure) authentication
     * challenge. This will be shown in a modal dialog and may be confusing for customers using assistive technologies like
     * screen readers. You should make your form accessible by ensuring that success or error messages are clearly read out
     * after this method completes.
     *
     */
    confirmCardPayment(
        /**
         * The [client secret](https://stripe.com/docs/api/payment_intents/object#payment_intent_object-client_secret) of the PaymentIntent.
         */
        clientSecret: string,

        /**
         * Data to be sent with the request. Refer to the Payment Intents API for a full list of parameters.
         */
        data?: StripeConfirmCardPaymentData,

        /**
         * An options object to control the behavior of this method.
         */
        options?: StripeConfirmPaymentOptions
    ): Promise<{paymentIntent?: PaymentIntent; error?: StripeError}>;

    /**
     * @docs https://stripe.com/docs/js/payment_intents/confirm_ideal_payment
     *
     * Use `stripe.confirmIdealPayment` in the [iDEAL Payments with Payment Methods](https://stripe.com/docs/payments/ideal)
     * flow when the customer submits your payment form. When called, it will confirm the `PaymentIntent` with `data` you
     * provide, and it will automatically redirect the customer to the authorize the transaction.
     * Once authorization is complete, the customer will be redirected back to your specified `return_url`.
     *
     * When you confirm a `PaymentIntent`, it needs to have an attached [PaymentMethod](https://stripe.com/docs/api/payment_methods).
     * In addition to confirming the `PaymentIntent`, this method can automatically create and attach a new `PaymentMethod` for you.
     * It can also be called with an existing `PaymentMethod`, or if you have already attached a PaymentMethod you can call this
     * method without needing to provide any additional data. These use cases are detailed in the sections that follow.
     *
     * @returns
     * By default, `stripe.confirmIdealPayment` will trigger a redirect when successful. If there is an error, or when handling
     * next actions manually by using the `handleActions: false` option, it will return a `Promise` which resolves with a `result`
     * object. This object has either:
     *
     * - result.paymentIntent: the successful PaymentIntent.
     * - result.error: an error. Refer to the API reference for all possible errors.
     *
     * Note that `stripe.confirmIdealPayment` may take several seconds to complete. During that time, you should disable
     * your form from being resubmitted and show a waiting indicator like a spinner. If you receive an error result,
     * you should be sure to show that error to the customer, re-enable the form, and hide the waiting indicator.
     */
    confirmIdealPayment(
        /**
         * The [client secret](https://stripe.com/docs/api/payment_intents/object#payment_intent_object-client_secret) of the PaymentIntent.
         */
        clientSecret: string,

        /**
         * Data to be sent with the request. Refer to the Payment Intents API for a full list of parameters.
         */
        data?: StripeConfirmIdealPaymentData,

        /**
         * An options object to control the behavior of this method.
         */
        options?: StripeConfirmPaymentOptions
    ): Promise<{paymentIntent?: PaymentIntent; error?: StripeError}>;

    /**
     *
     * Use `stripe.confirmSepaDebitPayment` in the [SEPA Direct Debit Payments](https://stripe.com/docs/payments/sepa-debit)
     * with Payment Methods flow when the customer submits your payment form. When called, it will confirm the
     * [PaymentIntent](https://stripe.com/docs/api/payment_intents) with `data` you provide. Note that there are some additional
     * requirements to this flow that are not covered in this reference. Refer to our [integration guide](https://stripe.com/docs/payments/sepa-debit
     * for more details.
     *
     * When you confirm a PaymentIntent, it needs to have an attached PaymentMethod. In addition to confirming the PaymentIntent,
     * this method can automatically create and attach a new PaymentMethod for you. If you have already attached a
     * [PaymentMethod](https://stripe.com/docs/api/payment_methods) you can call this method without needing to provide any additional data.
     * These use cases are detailed in the sections that follow.
     * @docs https://stripe.com/docs/js/payment_intents/confirm_sepa_debit_payment
     */
    confirmSepaDebitPayment(
        /**
         * The [client secret](https://stripe.com/docs/api/payment_intents/object#payment_intent_object-client_secret) of the PaymentIntent.
         */
        clientSecret: string,

        /**
         * Data to be sent with the request. Refer to the [Payment Intents API](https://stripe.com/docs/api/payment_intents/confirm) for a full list of parameters.
         */
        data?: StripeConfirmSepaPaymentData
    ): Promise<{paymentIntent?: PaymentIntent; error?: StripeError}>;

    /**
     * Use stripe.createPaymentMethod to convert payment information collected by elements into a PaymentMethod
     * object that you safely pass to your server to use in an API call.
     * @docs https://stripe.com/docs/js/payment_methods/create_payment_method
     *
     * @param type: String, The type of the PaymentMethod to create. Refer to the PaymentMethod API for all possible values.
     * @param card: StripeElement, A card or cardNumber Element.
     * @param billing_details: StripeBillingDetails, Billing information associated with the PaymentMethod that
     * may be used or required by particular types of payment methods.
     */
    createPaymentMethod(
        params: CreatePaymentMethodParams
    ): Promise<{paymentMethod?: PaymentMethod; error?: StripeError}>;

    /**
     * Use stripe.handleCardAction in the Payment Intents API manual confirmation flow to handle a PaymentIntent
     * with the requires_action status. It will throw an error if the PaymentIntent has a different status.
     * @docs https://stripe.com/docs/js/payment_intents/handle_card_action
     *
     * @param paymentIntentClientSecret: String, The client secret of the PaymentIntent to handle.
     */
    handleCardAction(
        paymentIntentClientSecret: string
    ): Promise<{paymentIntent?: PaymentIntent; error?: StripeError}>;
}

export interface CreatePaymentMethodParams {
    type: StripePaymentMethodType;
    card: StripeElement;
    billing_details?: StripeBillingDetails;
}

export interface StripeHostWindow extends Window {
    Stripe?(
        stripePublishableKey: string,
        options?: StripeConfigurationOptions
    ): StripeV3Client;
}

export enum StripeElementType {
    Alipay = 'alipay',
    CardCvc = 'cardCvc',
    CardExpiry = 'cardExpiry',
    CardNumber = 'cardNumber',
    CreditCard = 'card',
    iDEAL = 'idealBank',
    Sepa = 'iban',
}

export enum StripePaymentMethodType {
    Alipay = 'alipay',
    CreditCard = 'card',
    iDEAL = 'ideal',
    Sepa = 'sepa_debit',
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

export interface StripeAdditionalActionData {
    redirect_url?: string;
    intent?: string;
}

export interface StripeAdditionalAction {
    type: string;
    data: StripeAdditionalActionData;
}

export interface StripeAdditionalActionError {
    body: {
        errors?: Array<{ code: string; message?: string }>;
        additional_action_required: StripeAdditionalAction;
        three_ds_result: { token: string };
    };
}

export interface StripeCardElements {
    [index: number]: StripeElement;
}

export interface IndividualCardElementOptions {
    cardCvcElementOptions: CardCvcElementOptions;
    cardExpiryElementOptions: CardExpiryElementOptions;
    cardNumberElementOptions: CardNumberElementOptions;
    zipCodeElementOptions?: ZipCodeElementOptions;
}

export default function isIndividualCardElementOptions(individualCardElementOptions: unknown): individualCardElementOptions is IndividualCardElementOptions {
    return Boolean((individualCardElementOptions as IndividualCardElementOptions).cardNumberElementOptions) &&
        Boolean((individualCardElementOptions as IndividualCardElementOptions).cardCvcElementOptions) &&
        Boolean((individualCardElementOptions as IndividualCardElementOptions).cardExpiryElementOptions);
}
