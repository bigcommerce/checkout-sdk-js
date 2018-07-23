import BillingAddress from './billing-address';
import BillingAddressState from './billing-address-state';

export function getBillingAddress(): BillingAddress {
    return {
        id: '55c96cda6f04c',
        firstName: 'Test',
        lastName: 'Tester',
        email: 'test@bigcommerce.com',
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
        customFields: [],
    };
}

export function getBillingAddressState(): BillingAddressState {
    return {
        data: getBillingAddress(),
        errors: {},
        statuses: {},
    };
}
