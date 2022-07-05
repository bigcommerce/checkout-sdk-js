import { CustomerInitializeOptions } from '@bigcommerce/checkout-sdk/payment-integration';

export function getApplePayCustomerInitializationOptions(): CustomerInitializeOptions {
    return {
        methodId: 'applepay',
        applepay: {
            container: 'applePayCheckoutButton',
            shippingLabel: 'Shipping',
            subtotalLabel: 'Subtotal',
            onPaymentAuthorize: jest.fn(),
            onError: jest.fn(),
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
