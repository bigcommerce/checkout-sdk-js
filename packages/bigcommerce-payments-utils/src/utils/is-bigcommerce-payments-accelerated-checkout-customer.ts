import {
    PaymentProviderCustomer,
    PayPalConnectCustomer,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

export default function isBigCommercePaymentsAcceleratedCheckoutCustomer(
    customer?: PaymentProviderCustomer,
): customer is PayPalConnectCustomer {
    if (!customer) {
        return false;
    }

    return (
        'authenticationState' in customer || 'addresses' in customer || 'instruments' in customer
    );
}
