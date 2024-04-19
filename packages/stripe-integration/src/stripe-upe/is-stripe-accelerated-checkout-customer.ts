import {
    PaymentProviderCustomer,
    StripeAcceleratedCheckoutCustomer,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

export default function isStripeAcceleratedCheckoutCustomer(
    customer: PaymentProviderCustomer,
): customer is StripeAcceleratedCheckoutCustomer {
    return 'stripeLinkAuthenticationState' in customer;
}
