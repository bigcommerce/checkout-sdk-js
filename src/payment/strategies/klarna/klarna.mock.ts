import { BillingAddress } from '../../../billing/';

import { KlarnaUpdateSessionParams } from './klarna-credit';

export function getKlarnaUpdateSessionParams(): KlarnaUpdateSessionParams {
    return {
        billing_address: {
            street_address: '12345 Testing Way',
            city: 'Some City',
            country: 'DE',
            given_name: 'Test',
            family_name: 'Tester',
            postal_code: '95555',
            region: 'Berlin',
            email: 'test@bigcommerce.com',
        },
        shipping_address: {
            street_address: '12345 Testing Way',
            city: 'Some City',
            country: 'US',
            given_name: 'Test',
            family_name: 'Tester',
            postal_code: '95555',
            region: 'California',
            email: 'test@bigcommerce.com',
            phone: '555-555-5555',
        },
    };
}

export function getEUBillingAddress(): BillingAddress {
    return {
        id: '55c96cda6f04c',
        firstName: 'Test',
        lastName: 'Tester',
        email: 'test@bigcommerce.com',
        company: 'Bigcommerce',
        address1: '12345 Testing Way',
        address2: '',
        city: 'Some City',
        stateOrProvince: 'Berlin',
        stateOrProvinceCode: 'CA',
        country: 'Germany',
        countryCode: 'DE',
        postalCode: '95555',
        phone: '555-555-5555',
        customFields: [],
    };
}

export function getOCBillingAddress(): BillingAddress {
    return {
        ...getEUBillingAddress(),
        countryCode: 'AU',
    };
}

export function getEUBillingAddressWithNoPhone(): BillingAddress {
    return {
        id: '55c96cda6f04c',
        firstName: 'Test',
        lastName: 'Tester',
        email: 'test@bigcommerce.com',
        company: 'Bigcommerce',
        address1: '12345 Testing Way',
        address2: '',
        city: 'Some City',
        stateOrProvince: 'Berlin',
        stateOrProvinceCode: 'CA',
        country: 'Germany',
        countryCode: 'DE',
        postalCode: '95555',
        phone: '',
        customFields: [],
    };
}

export function getKlarnaUpdateSessionParamsPhone(): KlarnaUpdateSessionParams {
    return {
        billing_address: {
            street_address: '12345 Testing Way',
            city: 'Some City',
            country: 'DE',
            given_name: 'Test',
            family_name: 'Tester',
            postal_code: '95555',
            region: 'Berlin',
            email: 'test@bigcommerce.com',
            phone: '555-555-5555',
        },
        shipping_address: {
            street_address: '12345 Testing Way',
            city: 'Some City',
            country: 'US',
            given_name: 'Test',
            family_name: 'Tester',
            postal_code: '95555',
            region: 'California',
            email: 'test@bigcommerce.com',
            phone: '555-555-5555',
        },
    };
}

export function getKlarnaUpdateSessionParamsForOC(): KlarnaUpdateSessionParams {
    return {
        ...getKlarnaUpdateSessionParamsPhone(),
        billing_address: {
            street_address: '12345 Testing Way',
            city: 'Some City',
            country: 'AU',
            given_name: 'Test',
            family_name: 'Tester',
            postal_code: '95555',
            region: 'CA',
            email: 'test@bigcommerce.com',
            phone: '555-555-5555',
        },
    };
}
