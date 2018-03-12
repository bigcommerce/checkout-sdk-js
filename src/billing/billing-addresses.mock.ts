
import { Address } from '../address';

export function getBillingAddress(): Address {
    return {
        id: '55c96cda6f04c',
        firstName: 'Test',
        lastName: 'Tester',
        company: 'Bigcommerce',
        street1: '12345 Testing Way',
        street2: '',
        city: 'Some City',
        region: 'California',
        regionCode: 'CA',
        country: 'United States',
        countryCode: 'US',
        postalCode: '95555',
        phone: '555-555-5555',
        customFields: [],
    };
}
