"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var customers_mock_1 = require("../customer/customers.mock");
var errors_mock_1 = require("../common/error/errors.mock");
var quotes_mock_1 = require("../quote/quotes.mock");
var shipping_address_mock_1 = require("./shipping-address.mock");
var shipping_options_mock_1 = require("../shipping/shipping-options.mock");
var customerActionTypes = require("../customer/customer-action-types");
var quoteActionTypes = require("../quote/quote-action-types");
var shippingAddressActionTypes = require("../shipping/shipping-address-action-types");
var shippingOptionActionTypes = require("../shipping/shipping-option-action-types");
var shipping_option_reducer_1 = require("./shipping-option-reducer");
describe('shippingOptionReducer()', function () {
    var initialState;
    beforeEach(function () {
        initialState = {
            meta: {},
            data: {},
        };
    });
    it('returns a new state with shipping options data and loading flag set to false', function () {
        var response = quotes_mock_1.getQuoteResponseBody();
        var action = {
            type: quoteActionTypes.LOAD_QUOTE_SUCCEEDED,
            meta: response.meta,
            payload: response.data,
        };
        expect(shipping_option_reducer_1.default(initialState, action)).toEqual(expect.objectContaining({
            data: action.payload.shippingOptions,
        }));
    });
    it('returns new shipping option data if customer has signed in successfully', function () {
        var action = {
            type: customerActionTypes.SIGN_IN_CUSTOMER_SUCCEEDED,
            payload: customers_mock_1.getCustomerResponseBody().data,
        };
        expect(shipping_option_reducer_1.default(initialState, action)).toEqual(expect.objectContaining({
            data: action.payload.shippingOptions,
        }));
    });
    it('returns new shipping option data if customer has signed out successfully', function () {
        var action = {
            type: customerActionTypes.SIGN_OUT_CUSTOMER_SUCCEEDED,
            payload: customers_mock_1.getCustomerResponseBody().data,
        };
        expect(shipping_option_reducer_1.default(initialState, action)).toEqual(expect.objectContaining({
            data: action.payload.shippingOptions,
        }));
    });
    it('returns a loading state if fetching shipping options', function () {
        var action = {
            type: shippingOptionActionTypes.LOAD_SHIPPING_OPTIONS_REQUESTED,
        };
        expect(shipping_option_reducer_1.default(initialState, action)).toEqual(expect.objectContaining({
            errors: { loadError: undefined },
            statuses: { isLoading: true },
        }));
    });
    it('returns new shipping option data if it loads correctly', function () {
        var action = {
            type: shippingOptionActionTypes.LOAD_SHIPPING_OPTIONS_SUCCEEDED,
            payload: shipping_options_mock_1.getShippingOptionResponseBody().data,
        };
        expect(shipping_option_reducer_1.default(initialState, action)).toEqual(expect.objectContaining({
            data: action.payload.shippingOptions,
        }));
    });
    it('returns an error state if shipping options can not be fetched', function () {
        var action = {
            type: shippingOptionActionTypes.LOAD_SHIPPING_OPTIONS_FAILED,
            payload: errors_mock_1.getErrorResponseBody(),
        };
        expect(shipping_option_reducer_1.default(initialState, action)).toEqual(expect.objectContaining({
            errors: { loadError: action.payload },
            statuses: { isLoading: false },
        }));
    });
    it('returns a loading state if selection shipping option', function () {
        var action = {
            type: shippingOptionActionTypes.SELECT_SHIPPING_OPTION_REQUESTED,
        };
        expect(shipping_option_reducer_1.default(initialState, action)).toEqual(expect.objectContaining({
            errors: { selectError: undefined },
            statuses: { isSelecting: true },
        }));
    });
    it('returns new shipping option data when a selection succedes', function () {
        var action = {
            type: shippingOptionActionTypes.SELECT_SHIPPING_OPTION_SUCCEEDED,
            payload: shipping_options_mock_1.getShippingOptionResponseBody().data,
        };
        expect(shipping_option_reducer_1.default(initialState, action)).toEqual(expect.objectContaining({
            data: action.payload.shippingOptions,
        }));
    });
    it('returns an error state if shipping option selection fails', function () {
        var action = {
            type: shippingOptionActionTypes.SELECT_SHIPPING_OPTION_FAILED,
            payload: errors_mock_1.getErrorResponseBody(),
        };
        expect(shipping_option_reducer_1.default(initialState, action)).toEqual(expect.objectContaining({
            errors: { selectError: action.payload },
            statuses: { isSelecting: false },
        }));
    });
    it('returns a new state when updating shipping address', function () {
        var response = shipping_address_mock_1.getShippingAddressResponseBody();
        var action = {
            type: shippingAddressActionTypes.UPDATE_SHIPPING_ADDRESS_SUCCEEDED,
            payload: response.data,
        };
        expect(shipping_option_reducer_1.default(initialState, action)).toEqual(expect.objectContaining({
            data: action.payload.shippingOptions,
        }));
    });
});
//# sourceMappingURL=shipping-option-reducer.spec.js.map