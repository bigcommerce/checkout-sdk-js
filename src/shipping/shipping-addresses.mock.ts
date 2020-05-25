import { Address } from '../address';

export function getShippingAddress(): Address {
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

export function getShippingAddressWithCustomFields(): Address {
    return {
        firstName: 'Amazon',
        lastName: 'Tester',
        company: 'Bigcommerce',
        address1: '12345 Amazon Test',
        address2: 'Test Street',
        city: 'Testing City',
        stateOrProvince: 'New York',
        stateOrProvinceCode: 'NY',
        country: 'United States',
        countryCode: 'US',
        postalCode: '95555',
        phone: '666-666-6666',
        customFields: [
            {
                fieldId: 'field_25',
                fieldValue: '33',
            },
        ],
    };
}
