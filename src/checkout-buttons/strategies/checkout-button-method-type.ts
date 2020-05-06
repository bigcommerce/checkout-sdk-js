enum CheckoutButtonMethodType {
    BRAINTREE_PAYPAL = 'braintreepaypal',
    BRAINTREE_PAYPAL_CREDIT = 'braintreepaypalcredit',
    GOOGLEPAY_ADYENV2 = 'googlepayadyenv2',
    GOOGLEPAY_AUTHORIZENET = 'googlepayauthorizenet',
    GOOGLEPAY_BRAINTREE = 'googlepaybraintree',
    GOOGLEPAY_STRIPE = 'googlepaystripe',
    MASTERPASS = 'masterpass',
    PAYPALEXPRESS = 'paypalexpress',
    /**
     * @internal
     */
    PAYPALCOMMERCE = 'paypalcommerce',
}

export default CheckoutButtonMethodType;
