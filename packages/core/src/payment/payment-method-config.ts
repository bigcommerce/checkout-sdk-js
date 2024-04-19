export default interface PaymentMethodConfig {
    cardCode?: boolean;
    displayName?: string;
    enablePaypal?: boolean;
    hasDefaultStoredInstrument?: boolean;
    helpText?: string;
    is3dsEnabled?: boolean;
    isHostedFormEnabled?: boolean;
    isVaultingCvvEnabled?: boolean;
    isVaultingEnabled?: boolean;
    isVisaCheckoutEnabled?: boolean;
    logo?: string;
    merchantId?: string;
    redirectUrl?: string;
    requireCustomerCode?: boolean;
    returnUrl?: string;
    showCardHolderName?: boolean;
    testMode?: boolean;
}
