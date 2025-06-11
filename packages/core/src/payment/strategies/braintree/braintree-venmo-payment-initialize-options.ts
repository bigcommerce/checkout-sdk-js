export default interface BraintreeVenmoInitializeOptions {
    /**
     * An option that can provide different payment authorization methods, for more information use the following link: https://developer.paypal.com/braintree/docs/guides/venmo/client-side/javascript/v3/#desktop-qr-code
     * If no value is specified, it will be true
     */
    allowDesktop?: boolean;
}
