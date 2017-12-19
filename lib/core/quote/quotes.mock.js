"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var carts_mock_1 = require("../cart/carts.mock");
var customers_mock_1 = require("../customer/customers.mock");
var orders_mock_1 = require("../order/orders.mock");
var shipping_options_mock_1 = require("../shipping/shipping-options.mock");
function getQuote() {
    return {
        orderComment: '',
        shippingOption: '0:61d4bb52f746477e1d4fb411221318c3',
        shippingAddress: {
            id: '59a6bc597d832',
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
        },
        billingAddress: {
            id: '59a6bc597d832',
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
        },
    };
}
exports.getQuote = getQuote;
function getQuoteMeta() {
    return {
        request: {
            geoCountryCode: 'AU',
            deviceSessionId: 'a37230e9a8e4ea2d7765e2f3e19f7b1d',
            sessionHash: 'cfbbbac580a920b395571fe086db1e06',
        },
    };
}
exports.getQuoteMeta = getQuoteMeta;
function getQuoteResponseBody() {
    return {
        data: {
            quote: getQuote(),
            customer: customers_mock_1.getGuestCustomer(),
            cart: carts_mock_1.getCart(),
            order: orders_mock_1.getIncompleteOrder(),
            shippingOptions: shipping_options_mock_1.getShippingOptions(),
        },
        meta: getQuoteMeta(),
    };
}
exports.getQuoteResponseBody = getQuoteResponseBody;
function getQuoteState() {
    return {
        meta: getQuoteMeta(),
        data: getQuote(),
    };
}
exports.getQuoteState = getQuoteState;
//# sourceMappingURL=quotes.mock.js.map