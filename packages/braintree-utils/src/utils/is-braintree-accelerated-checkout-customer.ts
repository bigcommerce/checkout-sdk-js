import {
    BraintreeAcceleratedCheckoutCustomer,
    PaymentProviderCustomer,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

export default function isBraintreeAcceleratedCheckoutCustomer(
    customer?: PaymentProviderCustomer,
): customer is BraintreeAcceleratedCheckoutCustomer {
    if (!customer) {
        return false;
    }

    return (
        'authenticationState' in customer || 'addresses' in customer || 'instruments' in customer
    );
}
