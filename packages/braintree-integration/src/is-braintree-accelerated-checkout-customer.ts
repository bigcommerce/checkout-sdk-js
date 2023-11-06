import {
    BraintreeAcceleratedCheckoutCustomer,
    PaymentProviderCustomer,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

export default function isBraintreeAcceleratedCheckoutCustomer(
    customer: PaymentProviderCustomer,
): customer is BraintreeAcceleratedCheckoutCustomer {
    return (
        'authenticationState' in customer || 'addresses' in customer || 'instruments' in customer
    );
}
