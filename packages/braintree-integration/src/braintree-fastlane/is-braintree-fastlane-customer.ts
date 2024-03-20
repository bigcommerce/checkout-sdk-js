import {
    PaymentProviderCustomer,
    BraintreeFastlaneCustomer,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

export default function isBraintreeFastlaneCustomer(
    customer?: PaymentProviderCustomer,
): customer is BraintreeFastlaneCustomer {
    if (!customer) {
        return false;
    }

    return (
        'authenticationState' in customer || 'addresses' in customer || 'instruments' in customer
    );
}
