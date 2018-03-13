import { getCart } from '../cart/internal-carts.mock';
import { getQuote } from '../quote/internal-quotes.mock';

export function getBillingAddress() {
    return {
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
        type: 'residential',
        customFields: [],
    };
}

export function getBillingAddressResponseBody() {
    return {
        data: {
            quote: getQuote(),
            cart: getCart(),
            billingAddress: getBillingAddress(),
        },
    };
}
