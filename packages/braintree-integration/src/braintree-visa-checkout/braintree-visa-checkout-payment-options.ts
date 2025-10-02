export default interface BraintreeVisaCheckoutPaymentInitializeOptions {
    /**
     * A callback that gets called when Visa Checkout fails to initialize or
     * selects a payment option.
     *
     * @param error - The error object describing the failure.
     */
    onError?(error: Error): void;

    /**
     * A callback that gets called when the customer selects a payment option.
     */
    onPaymentSelect?(): void;
}

export interface WithBraintreeVisaCheckoutPaymentInitializeOptions {
    braintreevisacheckout?: BraintreeVisaCheckoutPaymentInitializeOptions;
}
