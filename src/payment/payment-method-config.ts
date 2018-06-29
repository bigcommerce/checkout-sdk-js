export default interface PaymentMethodConfig {
    cardCode?: boolean;
    displayName?: string;
    enablePaypal?: boolean;
    helpText?: string;
    is3dsEnabled?: boolean;
    isVisaCheckoutEnabled?: boolean;
    merchantId?: string;
    redirectUrl?: string;
    returnUrl?: string;
    testMode?: boolean;
}
