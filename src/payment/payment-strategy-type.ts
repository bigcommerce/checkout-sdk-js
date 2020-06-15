enum PaymentStrategyType {
    ADYENV2 = 'adyenv2',
    ADYENV2_GOOGLEPAY = 'googlepayadyenv2',
    AFFIRM = 'affirm',
    AFTERPAY = 'afterpay',
    AMAZON = 'amazon',
    AUTHORIZENET_GOOGLE_PAY = 'googlepayauthorizenet',
    /**
     * @alpha
     */
    AMAZONPAYV2 = 'amazonpay',
    BLUESNAPV2 = 'bluesnapv2',
    BOLT = 'bolt',
    CHECKOUTCOM = 'checkoutcom',
    CREDIT_CARD = 'creditcard',
    CHECKOUTCOM_GOOGLE_PAY = 'googlepaycheckoutcom',
    CYBERSOURCE = 'cybersource',
    KLARNA = 'klarna',
    KLARNAV2 = 'klarnav2',
    LAYBUY = 'laybuy',
    LEGACY = 'legacy',
    OFFLINE = 'offline',
    OFFSITE = 'offsite',
    PAYPAL = 'paypal',
    PAYPAL_EXPRESS = 'paypalexpress',
    PAYPAL_EXPRESS_CREDIT = 'paypalexpresscredit',
    /**
     * @internal
     */
    PAYPAL_COMMERCE = 'paypalcommerce',
    /**
     * @internal
     */
    PAYPAL_COMMERCE_CREDIT = 'paypalcommercecredit',
    SAGE_PAY = 'sagepay',
    SQUARE = 'squarev2',
    STRIPEV3 = 'stripev3',
    NO_PAYMENT_DATA_REQUIRED = 'nopaymentdatarequired',
    BRAINTREE = 'braintree',
    BRAINTREE_PAYPAL = 'braintreepaypal',
    BRAINTREE_PAYPAL_CREDIT = 'braintreepaypalcredit',
    BRAINTREE_VISA_CHECKOUT = 'braintreevisacheckout',
    BRAINTREE_GOOGLE_PAY = 'googlepaybraintree',
    CHASE_PAY = 'chasepay',
    WE_PAY = 'wepay',
    MASTERPASS = 'masterpass',
    STRIPE_GOOGLE_PAY = 'googlepaystripe',
    ZIP = 'zip',
    CONVERGE = 'converge',
}

export default PaymentStrategyType;
