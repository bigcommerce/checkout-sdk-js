export default interface BraintreeVisaCheckoutCustomerInitializeOptions {
    container: string;

    /**
     * A callback that gets called when Visa Checkout fails to initialize or
     * selects a payment option.
     *
     * @param error - The error object describing the failure.
     */
    onError?(error: Error): void;
}

export interface WithBraintreeVisaCheckoutCustomerInitializeOptions {
    braintreevisacheckout?: BraintreeVisaCheckoutCustomerInitializeOptions;
}
