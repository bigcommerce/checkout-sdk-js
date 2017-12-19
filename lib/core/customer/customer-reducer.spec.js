"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var customers_mock_1 = require("./customers.mock");
var orders_mock_1 = require("../order/orders.mock");
var errors_mock_1 = require("../common/error/errors.mock");
var quotes_mock_1 = require("../quote/quotes.mock");
var customerActionTypes = require("../customer/customer-action-types");
var orderActionTypes = require("../order/order-action-types");
var quoteActionTypes = require("../quote/quote-action-types");
var customer_reducer_1 = require("./customer-reducer");
describe('customerReducer()', function () {
    var initialState;
    beforeEach(function () {
        initialState = {};
    });
    it('returns new state with customer data if quote is fetched successfully', function () {
        var response = quotes_mock_1.getQuoteResponseBody();
        var action = {
            type: quoteActionTypes.LOAD_QUOTE_SUCCEEDED,
            meta: response.meta,
            payload: response.data,
        };
        expect(customer_reducer_1.default(initialState, action)).toEqual(expect.objectContaining({
            data: action.payload.customer,
        }));
    });
    it('returns new customer data if order is fetched successfully', function () {
        var response = orders_mock_1.getCompleteOrderResponseBody();
        var action = {
            type: orderActionTypes.LOAD_ORDER_SUCCEEDED,
            meta: response.meta,
            payload: response.data,
        };
        expect(customer_reducer_1.default(initialState, action)).toEqual(expect.objectContaining({
            data: action.payload.customer,
        }));
    });
    it('returns new customer data if order is submitted successfully', function () {
        var response = orders_mock_1.getCompleteOrderResponseBody();
        var action = {
            type: orderActionTypes.SUBMIT_ORDER_SUCCEEDED,
            meta: response.meta,
            payload: response.data,
        };
        expect(customer_reducer_1.default(initialState, action)).toEqual(expect.objectContaining({
            data: action.payload.customer,
        }));
    });
    it('returns new customer data if order is finalized successfully', function () {
        var response = orders_mock_1.getCompleteOrderResponseBody();
        var action = {
            type: orderActionTypes.FINALIZE_ORDER_SUCCEEDED,
            meta: response.meta,
            payload: response.data,
        };
        expect(customer_reducer_1.default(initialState, action)).toEqual(expect.objectContaining({
            data: action.payload.customer,
        }));
    });
    it('returns new customer data while signing in customer', function () {
        var action = {
            type: customerActionTypes.SIGN_IN_CUSTOMER_REQUESTED,
        };
        expect(customer_reducer_1.default(initialState, action)).toEqual(expect.objectContaining({
            data: {},
            statuses: { isSigningIn: true },
        }));
    });
    it('returns new customer data if customer has signed in successfully', function () {
        var action = {
            type: customerActionTypes.SIGN_IN_CUSTOMER_SUCCEEDED,
            payload: customers_mock_1.getCustomerResponseBody().data,
        };
        expect(customer_reducer_1.default(initialState, action)).toEqual(expect.objectContaining({
            data: action.payload.customer,
            statuses: { isSigningIn: false },
        }));
    });
    it('returns new customer data if customer has failed to sign in', function () {
        var action = {
            type: customerActionTypes.SIGN_IN_CUSTOMER_FAILED,
            payload: errors_mock_1.getErrorResponseBody(),
        };
        expect(customer_reducer_1.default(initialState, action)).toEqual(expect.objectContaining({
            data: {},
            errors: { signInError: errors_mock_1.getErrorResponseBody() },
            statuses: { isSigningIn: false },
        }));
    });
    it('returns new customer data while signing out customer', function () {
        var action = {
            type: customerActionTypes.SIGN_OUT_CUSTOMER_REQUESTED,
        };
        expect(customer_reducer_1.default(initialState, action)).toEqual(expect.objectContaining({
            data: {},
            statuses: { isSigningOut: true },
        }));
    });
    it('returns new customer data if customer has signed out successfully', function () {
        var action = {
            type: customerActionTypes.SIGN_OUT_CUSTOMER_SUCCEEDED,
            payload: customers_mock_1.getCustomerResponseBody().data,
        };
        expect(customer_reducer_1.default(initialState, action)).toEqual(expect.objectContaining({
            data: action.payload.customer,
            errors: {},
            statuses: { isSigningOut: false },
        }));
    });
    it('returns new customer data if customer has failed to sign out', function () {
        var action = {
            type: customerActionTypes.SIGN_OUT_CUSTOMER_FAILED,
            payload: errors_mock_1.getErrorResponseBody(),
        };
        expect(customer_reducer_1.default(initialState, action)).toEqual(expect.objectContaining({
            errors: { signOutError: errors_mock_1.getErrorResponseBody() },
            statuses: { isSigningOut: false },
        }));
    });
});
//# sourceMappingURL=customer-reducer.spec.js.map