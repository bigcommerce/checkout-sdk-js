export { default } from '../../generated/checkout-button-method-type';

export enum BaseCheckoutButtonMethodType {
    AMAZON_PAY_V2 = 'amazonpay',
    BRAINTREE_PAYPAL = 'braintreepaypal',
    BRAINTREE_VENMO = 'braintreevenmo',
    BRAINTREE_PAYPAL_CREDIT = 'braintreepaypalcredit',
    GOOGLEPAY_ADYENV2 = 'googlepayadyenv2',
    GOOGLEPAY_ADYENV3 = 'googlepayadyenv3',
    GOOGLEPAY_AUTHORIZENET = 'googlepayauthorizenet',
    GOOGLEPAY_BNZ = 'googlepaybnz',
    GOOGLEPAY_BRAINTREE = 'googlepaybraintree',
    GOOGLEPAY_CHECKOUTCOM = 'googlepaycheckoutcom',
    GOOGLEPAY_CYBERSOURCEV2 = 'googlepaycybersourcev2',
    GOOGLEPAY_ORBITAL = 'googlepayorbital',
    GOOGLEPAY_STRIPE = 'googlepaystripe',
    GOOGLEPAY_STRIPEUPE = 'googlepaystripeupe',
    MASTERPASS = 'masterpass',
    PAYPALEXPRESS = 'paypalexpress',
    PAYPALCOMMERCE_APMS = 'paypalcommercealternativemethods', // TODO: this block of code should be removed in PAYPAL-1921
    PAYPALCOMMERCE_APMS_TEMPORARY = 'paypalcommercealternativemethodsv2', // TODO: this block of code should be removed in PAYPAL-1921
}
