import {
    PaymentProviderCustomer,
    PayPalCommerceAcceleratedCheckoutCustomer,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

export default function isPayPalCommerceAcceleratedCheckoutCustomer(
    customer?: PaymentProviderCustomer,
): customer is PayPalCommerceAcceleratedCheckoutCustomer {
    if (!customer) {
        return false;
    }

    return (
        'authenticationState' in customer || 'addresses' in customer || 'instruments' in customer
    );
}
