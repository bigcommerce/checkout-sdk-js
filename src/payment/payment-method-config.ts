export default interface PaymentMethodConfig {
    cardCode?: boolean;
    displayName?: string;
    enablePaypal?: boolean;
    hasDefaultStoredInstrument?: boolean;
    helpText?: string;
    is3dsEnabled?: boolean;
    isVaultingCvvEnabled?: boolean;
    isVaultingEnabled?: boolean;
    isVisaCheckoutEnabled?: boolean;
    merchantId?: string;
    redirectUrl?: string;
    requireCustomerCode?: boolean;
    returnUrl?: string;
    testMode?: boolean;
}
