import { getCart } from '../cart/carts.mock';
import { getQuote } from '../quote/quotes.mock';
import { getShippingOptions } from './shipping-options.mock';

export function getShippingAddress() {
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
        isValid: false,
        customFields: [],
    };
}

export function getShippingAddressResponseBody() {
    return {
        data: {
            quote: getQuote(),
            cart: getCart(),
            shippingAddress: getShippingAddress(),
            shippingOptions: getShippingOptions(),
        },
    };
}
