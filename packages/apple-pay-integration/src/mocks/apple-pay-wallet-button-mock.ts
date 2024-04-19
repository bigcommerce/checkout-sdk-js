import { CustomerInitializeOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { WithApplePayCustomerInitializeOptions } from '../apple-pay-customer-initialize-options';

export function getApplePayCustomerInitializationOptions(): CustomerInitializeOptions &
    WithApplePayCustomerInitializeOptions {
    return {
        methodId: 'applepay',
        applepay: {
            container: 'applePayCheckoutButton',
            shippingLabel: 'Shipping',
            subtotalLabel: 'Subtotal',
            onPaymentAuthorize: jest.fn(),
            onError: jest.fn(),
            onClick: jest.fn(),
        },
    };
}

export function getContactAddress() {
    return {
        administrativeArea: 'CA',
        country: 'United States',
        countryCode: 'US',
        emailAddress: 'test@test.com',
        familyName: '',
        givenName: '',
        locality: 'San Francisco',
        phoneticFamilyName: '',
        phoneticGivenName: '',
        postalCode: '94114',
        subAdministrativeArea: '',
        subLocality: '',
    };
}
