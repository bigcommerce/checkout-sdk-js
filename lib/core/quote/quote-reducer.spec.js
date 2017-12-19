"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var billing_address_mock_1 = require("../billing/billing-address.mock");
var customers_mock_1 = require("../customer/customers.mock");
var errors_mock_1 = require("../common/error/errors.mock");
var quotes_mock_1 = require("./quotes.mock");
var shipping_address_mock_1 = require("../shipping/shipping-address.mock");
var shipping_options_mock_1 = require("../shipping/shipping-options.mock");
var billingAddressActionTypes = require("../billing/billing-address-action-types");
var customerActionTypes = require("../customer/customer-action-types");
var quoteActionTypes = require("./quote-action-types");
var shippingAddressActionTypes = require("../shipping/shipping-address-action-types");
var shippingOptionActionTypes = require("../shipping/shipping-option-action-types");
var quote_reducer_1 = require("./quote-reducer");
describe('quoteReducer()', function () {
    var initialState;
    beforeEach(function () {
        initialState = {
            data: quotes_mock_1.getQuote(),
        };
    });
    it('returns a new state with loading flag set to true', function () {
        var action = {
            type: quoteActionTypes.LOAD_QUOTE_REQUESTED,
        };
        expect(quote_reducer_1.default(initialState, action)).toEqual(expect.objectContaining(tslib_1.__assign({}, initialState, { statuses: { isLoading: true } })));
    });
    it('returns new data while fetching quote', function () {
        var action = {
            type: quoteActionTypes.LOAD_QUOTE_REQUESTED,
        };
        expect(quote_reducer_1.default(initialState, action)).toEqual(expect.objectContaining({
            statuses: { isLoading: true },
        }));
    });
    it('returns new data if quote is fetched successfully', function () {
        var response = quotes_mock_1.getQuoteResponseBody();
        var action = {
            type: quoteActionTypes.LOAD_QUOTE_SUCCEEDED,
            meta: response.meta,
            payload: response.data,
        };
        expect(quote_reducer_1.default(initialState, action)).toEqual(expect.objectContaining({
            meta: expect.objectContaining({
                request: action.meta.request,
            }),
            data: action.payload.quote,
            statuses: { isLoading: false },
        }));
    });
    it('returns new data if quote is not fetched successfully', function () {
        var action = {
            type: quoteActionTypes.LOAD_QUOTE_FAILED,
            payload: errors_mock_1.getErrorResponseBody(),
        };
        expect(quote_reducer_1.default(initialState, action)).toEqual(expect.objectContaining(tslib_1.__assign({}, initialState, { errors: { loadError: action.payload }, statuses: { isLoading: false } })));
    });
    it('returns new data if customer has signed in successfully', function () {
        var action = {
            type: customerActionTypes.SIGN_IN_CUSTOMER_SUCCEEDED,
            payload: customers_mock_1.getCustomerResponseBody().data,
        };
        expect(quote_reducer_1.default(initialState, action)).toEqual(expect.objectContaining({
            data: action.payload.quote,
        }));
    });
    it('returns new data if customer has signed out successfully', function () {
        var action = {
            type: customerActionTypes.SIGN_OUT_CUSTOMER_SUCCEEDED,
            payload: customers_mock_1.getCustomerResponseBody().data,
        };
        expect(quote_reducer_1.default(initialState, action)).toEqual(expect.objectContaining({
            data: action.payload.quote,
        }));
    });
    it('returns new data when shipping options gets updated', function () {
        var response = shipping_options_mock_1.getShippingOptionResponseBody();
        var action = {
            type: shippingOptionActionTypes.LOAD_SHIPPING_OPTIONS_SUCCEEDED,
            meta: response.meta,
            payload: response.data,
        };
        expect(quote_reducer_1.default(initialState, action)).toEqual(expect.objectContaining({
            data: action.payload.quote,
        }));
    });
    it('returns new data when shipping options gets selected', function () {
        var response = shipping_options_mock_1.getShippingOptionResponseBody();
        var action = {
            type: shippingOptionActionTypes.SELECT_SHIPPING_OPTION_SUCCEEDED,
            meta: response.meta,
            payload: response.data,
        };
        expect(quote_reducer_1.default(initialState, action)).toEqual(expect.objectContaining({
            data: action.payload.quote,
        }));
    });
    describe('when updating shipping address', function () {
        it('sets updating flag to true while updating', function () {
            var action = {
                type: shippingAddressActionTypes.UPDATE_SHIPPING_ADDRESS_REQUESTED,
            };
            expect(quote_reducer_1.default(initialState, action)).toEqual(expect.objectContaining({
                statuses: { isUpdatingShippingAddress: true },
            }));
        });
        it('cleans errors while updating', function () {
            var action = {
                type: shippingAddressActionTypes.UPDATE_SHIPPING_ADDRESS_REQUESTED,
            };
            initialState.errors = {
                updateShippingAddressError: errors_mock_1.getErrorResponseBody(),
            };
            expect(quote_reducer_1.default(initialState, action)).toEqual(expect.objectContaining({
                errors: {
                    updateShippingAddressError: undefined,
                },
            }));
        });
        it('saves the payload when update succeeds', function () {
            var response = shipping_address_mock_1.getShippingAddressResponseBody();
            var action = {
                type: shippingAddressActionTypes.UPDATE_SHIPPING_ADDRESS_SUCCEEDED,
                payload: response.data,
            };
            expect(quote_reducer_1.default(initialState, action)).toEqual(expect.objectContaining({
                data: action.payload.quote,
            }));
        });
        it('sets updating flag to false when update succeeds', function () {
            var action = {
                type: shippingAddressActionTypes.UPDATE_SHIPPING_ADDRESS_SUCCEEDED,
                payload: errors_mock_1.getErrorResponseBody(),
            };
            expect(quote_reducer_1.default(initialState, action)).toEqual(expect.objectContaining({
                statuses: { isUpdatingShippingAddress: false },
            }));
        });
        it('cleans errors when update succeeds', function () {
            var action = {
                type: shippingAddressActionTypes.UPDATE_SHIPPING_ADDRESS_SUCCEEDED,
            };
            initialState.errors = {
                updateShippingAddressError: errors_mock_1.getErrorResponseBody(),
            };
            expect(quote_reducer_1.default(initialState, action)).toEqual(expect.objectContaining({
                errors: {
                    updateShippingAddressError: undefined,
                },
            }));
        });
        it('saves the error when update fails', function () {
            var action = {
                type: shippingAddressActionTypes.UPDATE_SHIPPING_ADDRESS_FAILED,
                payload: errors_mock_1.getErrorResponseBody(),
            };
            expect(quote_reducer_1.default(initialState, action)).toEqual(expect.objectContaining({
                errors: { updateShippingAddressError: action.payload },
            }));
        });
        it('sets the updating flag to false when update fails', function () {
            var action = {
                type: shippingAddressActionTypes.UPDATE_SHIPPING_ADDRESS_FAILED,
                payload: errors_mock_1.getErrorResponseBody(),
            };
            expect(quote_reducer_1.default(initialState, action)).toEqual(expect.objectContaining({
                errors: { updateShippingAddressError: action.payload },
            }));
        });
    });
    describe('when updating billing address', function () {
        it('sets updating flag to true while updating', function () {
            var action = {
                type: billingAddressActionTypes.UPDATE_BILLING_ADDRESS_REQUESTED,
            };
            expect(quote_reducer_1.default(initialState, action)).toEqual(expect.objectContaining({
                statuses: { isUpdatingBillingAddress: true },
            }));
        });
        it('cleans errors while updating', function () {
            var action = {
                type: billingAddressActionTypes.UPDATE_BILLING_ADDRESS_REQUESTED,
            };
            initialState.errors = {
                updateBillingAddressError: errors_mock_1.getErrorResponseBody(),
            };
            expect(quote_reducer_1.default(initialState, action)).toEqual(expect.objectContaining({
                errors: {
                    updateBillingAddressError: undefined,
                },
            }));
        });
        it('saves the payload when update succeeds', function () {
            var response = billing_address_mock_1.getBillingAddressResponseBody();
            var action = {
                type: billingAddressActionTypes.UPDATE_BILLING_ADDRESS_SUCCEEDED,
                payload: response.data,
            };
            expect(quote_reducer_1.default(initialState, action)).toEqual(expect.objectContaining({
                data: action.payload.quote,
            }));
        });
        it('sets updating flag to false if succeeded', function () {
            var action = {
                type: billingAddressActionTypes.UPDATE_BILLING_ADDRESS_SUCCEEDED,
                payload: errors_mock_1.getErrorResponseBody(),
            };
            expect(quote_reducer_1.default(initialState, action)).toEqual(expect.objectContaining({
                statuses: { isUpdatingBillingAddress: false },
            }));
        });
        it('cleans errors when update succeeds', function () {
            var action = {
                type: billingAddressActionTypes.UPDATE_BILLING_ADDRESS_SUCCEEDED,
            };
            initialState.errors = {
                updateBillingAddressError: errors_mock_1.getErrorResponseBody(),
            };
            expect(quote_reducer_1.default(initialState, action)).toEqual(expect.objectContaining({
                errors: {
                    updateBillingAddressError: undefined,
                },
            }));
        });
        it('saves the error when update fails', function () {
            var action = {
                type: billingAddressActionTypes.UPDATE_BILLING_ADDRESS_FAILED,
                payload: errors_mock_1.getErrorResponseBody(),
            };
            expect(quote_reducer_1.default(initialState, action)).toEqual(expect.objectContaining({
                errors: { updateBillingAddressError: action.payload },
            }));
        });
        it('sets the updating flag to false when update fails', function () {
            var action = {
                type: billingAddressActionTypes.UPDATE_BILLING_ADDRESS_FAILED,
                payload: errors_mock_1.getErrorResponseBody(),
            };
            expect(quote_reducer_1.default(initialState, action)).toEqual(expect.objectContaining({
                errors: { updateBillingAddressError: action.payload },
            }));
        });
    });
});
//# sourceMappingURL=quote-reducer.spec.js.map