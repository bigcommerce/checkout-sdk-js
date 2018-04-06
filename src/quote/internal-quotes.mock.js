import { getCart } from '../cart/internal-carts.mock';
import { getGuestCustomer } from '../customer/internal-customers.mock';
import { getIncompleteOrder } from '../order/internal-orders.mock';
import { getShippingOptions } from '../shipping/internal-shipping-options.mock';

export function getQuote() {
    return {
        orderComment: '',
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

export function getQuoteMeta() {
    return {
        request: {
            geoCountryCode: 'AU',
            deviceSessionId: 'a37230e9a8e4ea2d7765e2f3e19f7b1d',
            sessionHash: 'cfbbbac580a920b395571fe086db1e06',
        },
    };
}

export function getQuoteResponseBody() {
    return {
        data: {
            quote: getQuote(),
            customer: getGuestCustomer(),
            cart: getCart(),
            order: getIncompleteOrder(),
            shippingOptions: getShippingOptions(),
        },
        meta: getQuoteMeta(),
    };
}

export function getQuoteState() {
    return {
        meta: getQuoteMeta(),
        data: getQuote(),
    };
}
