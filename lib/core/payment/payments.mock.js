"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var carts_mock_1 = require("../cart/carts.mock");
var orders_mock_1 = require("../order/orders.mock");
var shipping_options_mock_1 = require("../shipping/shipping-options.mock");
var customers_mock_1 = require("../customer/customers.mock");
var payment_methods_mock_1 = require("./payment-methods.mock");
var quotes_mock_1 = require("../quote/quotes.mock");
function getPayment() {
    return {
        name: 'authorizenet',
        gateway: null,
        source: 'bcapp-checkout-uco',
        paymentData: {
            ccExpiry: {
                month: 10,
                year: 20,
            },
            ccName: 'BigCommerce',
            ccNumber: '4111111111111111',
            ccType: 'visa',
            ccCvv: '123',
        },
    };
}
exports.getPayment = getPayment;
function getPaymentRequestBody() {
    return {
        authToken: 'JWT eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1MDcxODcxMzMsIm5iZiI6MTUwNzE4MzUzMywiaXNzIjoicGF5bWVudHMuYmlnY29tbWVyY2UuY29tIiwic3ViIjoiMTUwNDA5ODgyMSIsImp0aSI6IjNkOTA4ZDE5LTY4OTMtNGQzYi1iMWEwLWJjNWYzMjRhM2ZiZCIsImlhdCI6MTUwNzE4MzUzMywiZGF0YSI6eyJzdG9yZV9pZCI6IjE1MDQwOTg4MjEiLCJvcmRlcl9pZCI6IjExOSIsImFtb3VudCI6MjAwMDAsImN1cnJlbmN5IjoiVVNEIn19.FSfZpI98l3_p5rbQdlHNeCfKR5Dwwk8_fvPZvtb64-Q',
        billingAddress: quotes_mock_1.getQuote().billingAddress,
        cart: carts_mock_1.getCart(),
        customer: customers_mock_1.getGuestCustomer(),
        order: orders_mock_1.getSubmittedOrder(),
        payment: getPayment().paymentData,
        paymentMethod: payment_methods_mock_1.getAuthorizenet(),
        quoteMeta: quotes_mock_1.getQuoteMeta(),
        shippingAddress: quotes_mock_1.getQuote().shippingAddress,
        shippingOption: shipping_options_mock_1.getFlatRateOption(),
        source: 'bcapp-checkout-uco',
        store: {
            storeHash: 'k1drp8k8',
            storeId: '1504098821',
            storeLanguage: 'en_US',
            storeName: 's1504098821',
        },
    };
}
exports.getPaymentRequestBody = getPaymentRequestBody;
function getPaymentResponseBody() {
    return {
        status: 'ok',
        id: 'b12e69cb-d76e-4d86-8d3d-94e8a07c9051',
        avs_result: {},
        cvv_result: {},
        three_ds_result: {},
        fraud_review: true,
        transaction_type: 'purchase',
        errors: [],
    };
}
exports.getPaymentResponseBody = getPaymentResponseBody;
function getErrorPaymentResponseBody() {
    return {
        status: 'error',
        id: '1093a806-6cc2-4b5a-b551-77fd21446a1b',
        avs_result: {},
        cvv_result: {},
        three_ds_result: {},
        fraud_review: true,
        transaction_type: 'purchase',
        errors: [
            'Insufficient funds',
        ],
    };
}
exports.getErrorPaymentResponseBody = getErrorPaymentResponseBody;
function getPaymentState() {
    return {
        meta: {},
        data: getPaymentRequestBody(),
    };
}
exports.getPaymentState = getPaymentState;
//# sourceMappingURL=payments.mock.js.map