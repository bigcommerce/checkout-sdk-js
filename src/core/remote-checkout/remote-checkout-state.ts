import RemoteCheckout from './remote-checkout';
import RemoteCheckoutMeta from './remote-checkout-meta';

export default interface RemoteCheckoutState {
    data?: RemoteCheckout;
    meta?: RemoteCheckoutMeta;
    errors: {
        initializeBillingError?: any;
        initializeShippingError?: any;
        initializePaymentError?: any;
    };
    statuses: {
        isInitializingBilling?: boolean;
        isInitializingShipping?: boolean;
        isInitializingPayment?: boolean;
    };
}
