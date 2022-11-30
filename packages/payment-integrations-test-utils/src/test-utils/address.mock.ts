import { Address, BillingAddress } from '@bigcommerce/checkout-sdk/payment-integration-api';

export function getAddress(): Address {
    return {
        firstName: 'Test',
        lastName: 'Tester',
        company: 'Bigcommerce',
        address1: '12345 Testing Way',
        address2: '',
        city: 'Some City',
        stateOrProvince: 'California',
        stateOrProvinceCode: 'CA',
        country: 'United States',
        countryCode: 'US',
        postalCode: '95555',
        phone: '555-555-5555',
        shouldSaveAddress: true,
        customFields: [],
    };
}

export function getBillingAddress(): BillingAddress {
    return {
        ...getAddress(),
        id: '55c96cda6f04c',
    };
}
