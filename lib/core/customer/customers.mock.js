"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var carts_mock_1 = require("../cart/carts.mock");
var quotes_mock_1 = require("../quote/quotes.mock");
var shipping_options_mock_1 = require("../shipping/shipping-options.mock");
function getGuestCustomer() {
    return {
        addresses: [],
        customerGroupId: 0,
        customerGroupName: '',
        customerId: 0,
        email: 'test@bigcommerce.com',
        firstName: 'Foo',
        isGuest: true,
        lastName: 'Bar',
        name: 'Foo Bar',
        phoneNumber: '987654321',
        storeCredit: 0,
    };
}
exports.getGuestCustomer = getGuestCustomer;
function getCustomerResponseBody() {
    return {
        data: {
            quote: quotes_mock_1.getQuote(),
            customer: getGuestCustomer(),
            cart: carts_mock_1.getCart(),
            shippingOptions: shipping_options_mock_1.getShippingOptions(),
        },
        meta: {},
    };
}
exports.getCustomerResponseBody = getCustomerResponseBody;
function getCustomerState() {
    return {
        data: getGuestCustomer(),
        meta: {},
    };
}
exports.getCustomerState = getCustomerState;
//# sourceMappingURL=customers.mock.js.map