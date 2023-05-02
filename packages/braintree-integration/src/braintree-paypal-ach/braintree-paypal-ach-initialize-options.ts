export interface BraintreePaypalAchInitializeOptions {
    /**
     * The text that should be displayed to the customer in UI for proof of authorization
     */
    mandateText: string;
}

export interface WithBraintreePaypalAchPaymentInitializeOptions {
    /**
     * The options that are required to initialize the Braintree ACH payment
     * method. They can be omitted unless you need to support Apple Pay.
     */
    braintreeach?: BraintreePaypalAchInitializeOptions;
}
