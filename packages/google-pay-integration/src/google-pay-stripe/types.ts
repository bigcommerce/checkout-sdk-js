export interface StripeUPEClient {
    /**
     * When called, it will confirm the PaymentIntent with data you provide and carry out 3DS or other next actions if they are required.
     */
    confirmCardPayment(clientSecret: string): Promise<StripeUpeResult>;

    /**
     * Retrieve a PaymentIntent using its client secret.
     */
    retrievePaymentIntent(clientSecret: string): Promise<StripeUpeResult>;
}

interface StripeUpeResult {
    paymentIntent?: PaymentIntent;
    error?: StripeError;
}

export interface StripeHostWindow extends Window {
    bcStripeClient?: StripeUPEClient;
    Stripe?(stripePublishableKey: string, options?: StripeConfigurationOptions): StripeUPEClient;
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
