import RemoteCheckout from './remote-checkout';
import RemoteCheckoutMeta from './remote-checkout-meta';

export default interface RemoteCheckoutState {
    data?: RemoteCheckout;
    meta?: RemoteCheckoutMeta;
    errors: {
        failedPaymentMethod?: string;
        initializeBillingError?: any;
        initializeShippingError?: any;
        initializePaymentError?: any;
        signOutError?: any;
    };
    statuses: {
        loadingPaymentMethod?: string;
        isInitializingBilling?: boolean;
        isInitializingShipping?: boolean;
        isInitializingPayment?: boolean;
        isSigningOut?: boolean;
    };
}
