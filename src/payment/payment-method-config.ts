export default interface PaymentMethodConfig {
    cardCode?: boolean;
    displayName?: string;
    is3dsEnabled?: boolean;
    merchantId?: string;
    redirectUrl?: string;
    testMode?: boolean;
}
