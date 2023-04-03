export interface BraintreePaypalAchInitializeOptions {
    /**
     * The text that should be displayed to the customer in UI for proof of authorization
     */
    mandateText: string;
}

export interface WithBraintreePaypalAchInitializeOptions {
    braintreeach?: BraintreePaypalAchInitializeOptions;
}
