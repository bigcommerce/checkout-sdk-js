import InternalQuote from './internal-quote';

export function getQuote(): InternalQuote {
    return {
        orderComment: 'comment',
        shippingOption: '0:61d4bb52f746477e1d4fb411221318c3',
        shippingAddress: {
            id: '55c96cda6f04c',
            firstName: 'Test',
            lastName: 'Tester',
            company: 'Bigcommerce',
            addressLine1: '12345 Testing Way',
            addressLine2: '',
            city: 'Some City',
            province: 'California',
            provinceCode: 'CA',
            postCode: '95555',
            country: 'United States',
            countryCode: 'US',
            phone: '555-555-5555',
            customFields: [],
        },
        billingAddress: {
            id: '55c96cda6f04c',
            firstName: 'Test',
            lastName: 'Tester',
            company: 'Bigcommerce',
            addressLine1: '12345 Testing Way',
            addressLine2: '',
            city: 'Some City',
            province: 'California',
            provinceCode: 'CA',
            postCode: '95555',
            country: 'United States',
            countryCode: 'US',
            phone: '555-555-5555',
            customFields: [],
        },
    };
}
