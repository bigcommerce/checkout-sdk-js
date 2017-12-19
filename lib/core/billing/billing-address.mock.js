"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var carts_mock_1 = require("../cart/carts.mock");
var quotes_mock_1 = require("../quote/quotes.mock");
function getBillingAddress() {
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
exports.getBillingAddress = getBillingAddress;
function getBillingAddressResponseBody() {
    return {
        data: {
            quote: quotes_mock_1.getQuote(),
            cart: carts_mock_1.getCart(),
            billingAddress: getBillingAddress(),
        },
    };
}
exports.getBillingAddressResponseBody = getBillingAddressResponseBody;
//# sourceMappingURL=billing-address.mock.js.map