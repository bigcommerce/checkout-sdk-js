export interface StripeHostWindow extends Window {
    Stripe?(
        stripePublishableKey: string,
        options: StripeV3JsOptions
    ): StripeV3Client;
}

export interface StripeV3JsOptions {
    betas: string[];
    stripeAccount: string;
}

export interface StripeV3Client {
    elements(): StripeElements;
    handleCardPayment(
        clientToken: string,
        options?: StripeHandleCardPaymentOptions
    ): Promise<StripePaymentIntentResponse>;
    createPaymentMethod(
        type: string,
        cardElement: StripeCardElement,
        options: StripePaymentMethodData
    ): Promise<StripePaymentMethodResponse>;
}

export interface StripeCardElement {
    mount(containerId: string): HTMLElement;
    unmount(): void;
}

export interface StripeElements {
    create(type: string, options: StripeElementsOptions): StripeCardElement;
}

export interface StripeAddress {
    city?: string;
    country?: string;
    line1?: string;
    line2?: string;
    postal_code?: string;
    state?: string;
}

export interface StripeBillingDetails {
    address?: StripeAddress;
    email?: string;
    name?: string;
    phone?: string;
}
export interface StripePaymentMethodData {
    billing_details: StripeBillingDetails;
}

export interface StripeShippingDetails {
    address: StripeAddress;
    name: string;
    carrier?: string;
    phone?: string;
    tracking_number?: string;
}

export interface StripeHandleCardPaymentOptions {
    /*
     * Use this parameter to supply additional data relevant to the payment method, such as billing details.
     */
    payment_method_data?: PaymentMethodData;

    /*
     * The shipping details for the payment, if collected.
     */
    shipping?: StripeShippingDetails;

    /*
     * Email address that the receipt for the resulting payment will be sent to.
     */
    receipt_email?: string;

    /*
     * If the PaymentIntent is associated with a customer and this parameter is set to true,
     * the provided payment method will be attached to the customer. Default is false.
     */
    save_payment_method?: boolean;
}

export interface StripeElementsOptions {
    style?: StripeStyleProps;
}

export interface StripeStyleProps {
    /**
     * The base class applied to the container.
     * Defaults to StripeElement.
     */
    base?: CardElementProps;

    /**
     * The class name to apply when the Element is complete.
     * Defaults to StripeElement--complete.
     */
    complete?: CardElementProps;

    /**
     * The class name to apply when the Element is empty.
     * Defaults to StripeElement--empty.
     */
    empty?: CardElementProps;

    /**
     * The class name to apply when the Element is focused.
     * Defaults to StripeElement--focus.
     */
    focus?: CardElementProps;

    /**
     * The class name to apply when the Element is invalid.
     * Defaults to StripeElement--invalid.
     */
    invalid?: CardElementProps;

    /**
     * The class name to apply when the Element has its value
     * autofilled by the browser (only on Chrome and Safari).
     * Defaults to StripeElement--webkit-autofill.
     */
    webkitAutofill?: CardElementProps;
}

export interface PaymentIntent {
    /*
     * Unique identifier for the object.
     */
    id?: string;
}

export interface PaymentMethod {
    /*
     * Unique identifier for the object.
     */
    id?: string;
}

export interface Error {
    type: string;
    code: string;
    message: string;
}

export interface Properties {
    color?: string;
    fontFamily?: string;
    fontSize?: string;
    fontSmoothing?: string;
    fontStyle?: string;
    fontVariant?: string;
    fontWeight?: string | number;
    iconColor?: string;
    lineHeight?: string | number;
    letterSpacing?: string;
    textAlign?: string;
    padding?: string;
    textDecoration?: string;
    textShadow?: string;
    textTransform?: string;
}

export interface StripePaymentIntentResponse {
    paymentIntent: PaymentIntent;
    error?: Error;
}

export interface StripePaymentMethodResponse {
    paymentMethod: PaymentMethod;
    error?: Error;
}

export interface MsClearProperties extends Properties {
    display?: string;
}

export interface BaseProps extends Properties {
    ':hover'?: Properties;
    ':focus'?: Properties;
    '::placeholder'?: Properties;
    '::selection'?: Properties;
    ':-webkit-autofill'?: Properties;
    ':disabled'?: Properties;
    '::ms-clear'?: MsClearProperties;
}

export interface CardElementProps extends BaseProps {
    /*
     * A pre-filled set of values to include in the input (e.g., {postalCode: '94110'}).
     * Note that sensitive card information (card number, CVC, and expiration date) cannot
     * be pre-filled.
     */
    value?: string;

    /*
     * Hide the postal code field. Default is false. If you are already collecting a full billing
     * address or postal code elsewhere, set this to true.
     */
    hidePostalCode?: boolean;

    /*
     * Appearance of the icon in the Element. Either 'solid' or 'default'.
     */
    iconStyle?: string;

    /*
     * Hides the icon in the Element. Default is false.
     */
    hideIcon?: boolean;

    /*
     * Applies a disabled state to the Element such that user input is not accepted. Default is
     * false.
     */
    disabled?: boolean;
}
