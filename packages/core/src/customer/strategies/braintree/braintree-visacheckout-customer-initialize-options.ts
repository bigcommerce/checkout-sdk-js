export default interface BraintreeVisaCheckoutCustomerInitializeOptions {
    container: string;
    onError?(error: Error): void;
}
