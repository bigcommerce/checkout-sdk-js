/**
 * A set of options that are required to initialize the shipping step of
 * checkout in order to support Braintree Accelerated Checkout.
 */
export default interface BraintreeAcceleratedCheckoutInitializeOptions {
    /**
     * The identifier of the payment method.
     */
    methodId: string;
}
