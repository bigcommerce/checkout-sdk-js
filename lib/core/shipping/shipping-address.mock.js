"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var carts_mock_1 = require("../cart/carts.mock");
var quotes_mock_1 = require("../quote/quotes.mock");
var shipping_options_mock_1 = require("./shipping-options.mock");
function getShippingAddress() {
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
exports.getShippingAddress = getShippingAddress;
function getShippingAddressResponseBody() {
    return {
        data: {
            quote: quotes_mock_1.getQuote(),
            cart: carts_mock_1.getCart(),
            shippingAddress: getShippingAddress(),
            shippingOptions: shipping_options_mock_1.getShippingOptions(),
        },
    };
}
exports.getShippingAddressResponseBody = getShippingAddressResponseBody;
//# sourceMappingURL=shipping-address.mock.js.map