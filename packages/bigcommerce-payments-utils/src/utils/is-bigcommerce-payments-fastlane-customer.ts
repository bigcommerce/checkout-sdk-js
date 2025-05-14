import {
    PaymentProviderCustomer,
    PayPalConnectCustomer,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

// TODO: rename this file to is-bigcommerce-payments-accelerated-checkout-customer and class to isBigCommercePaymentsAcceleratedCheckoutCustomer
export default function isBigCommercePaymentsFastlaneCustomer(
    customer?: PaymentProviderCustomer,
): customer is PayPalConnectCustomer {
    if (!customer) {
        return false;
    }

    return (
        'authenticationState' in customer || 'addresses' in customer || 'instruments' in customer
    );
}
