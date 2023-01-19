import OrderBillingAddressState, { OrderBillingAddress } from './order-billing-address-state';

export function getOrderBillingAddress(): OrderBillingAddress {
    return {
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
        shouldSaveAddress: true,
        phone: '555-555-5555',
        customFields: [],
    };
}

export function getOrderBillingAddressState(): OrderBillingAddressState {
    return {
        data: getOrderBillingAddress(),
    };
}
