export interface BraintreeAchInitializeOptions {
    /**
     * A callback that returns text that should be displayed to the customer in UI for proof of authorization
     */
    getMandateText: () => string;
}

export interface WithBraintreeAchPaymentInitializeOptions {
    /**
     * The options that are required to initialize the Braintree ACH payment
     * method. They can be omitted unless you need to support Apple Pay.
     */
    braintreeach?: BraintreeAchInitializeOptions;
}
