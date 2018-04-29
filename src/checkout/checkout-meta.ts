import { RemoteCheckoutStateData } from '../remote-checkout/remote-checkout-state';

export default interface CheckoutMeta {
    deviceFingerprint?: string;
    deviceSessionId?: string;
    geoCountryCode?: string;
    isCartVerified?: boolean;
    paymentAuthToken?: string;
    remoteCheckout?: RemoteCheckoutStateData;
    sessionHash?: string;
    vaultAccessExpiry?: number;
    vaultAccessToken?: string;
}
