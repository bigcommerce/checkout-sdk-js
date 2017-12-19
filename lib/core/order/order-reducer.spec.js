"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var orders_mock_1 = require("./orders.mock");
var errors_mock_1 = require("../common/error/errors.mock");
var quotes_mock_1 = require("../quote/quotes.mock");
var orderActionTypes = require("./order-action-types");
var quoteActionTypes = require("../quote/quote-action-types");
var order_reducer_1 = require("./order-reducer");
describe('orderReducer()', function () {
    var initialState;
    beforeEach(function () {
        initialState = {};
    });
    it('returns new data if quote is fetched successfully', function () {
        var response = quotes_mock_1.getQuoteResponseBody();
        var action = {
            type: quoteActionTypes.LOAD_QUOTE_SUCCEEDED,
            meta: response.meta,
            payload: response.data,
        };
        expect(order_reducer_1.default(initialState, action)).toEqual(expect.objectContaining({
            data: action.payload.order,
        }));
    });
    it('returns new data while fetching order', function () {
        var action = {
            type: orderActionTypes.LOAD_ORDER_REQUESTED,
        };
        expect(order_reducer_1.default(initialState, action)).toEqual(expect.objectContaining({
            statuses: { isLoading: true },
        }));
    });
    it('returns new data if it is fetched successfully', function () {
        var response = orders_mock_1.getCompleteOrderResponseBody();
        var action = {
            type: orderActionTypes.LOAD_ORDER_SUCCEEDED,
            meta: response.meta,
            payload: response.data,
        };
        expect(order_reducer_1.default(initialState, action)).toEqual(expect.objectContaining({
            data: action.payload.order,
            statuses: { isLoading: false },
        }));
    });
    it('returns new data if it is not fetched successfully', function () {
        var response = errors_mock_1.getErrorResponseBody();
        var action = {
            type: orderActionTypes.LOAD_ORDER_FAILED,
            payload: response.data,
        };
        expect(order_reducer_1.default(initialState, action)).toEqual(expect.objectContaining({
            errors: { loadError: action.payload },
            statuses: { isLoading: false },
        }));
    });
    it('returns new data while submitting order', function () {
        var action = {
            type: orderActionTypes.SUBMIT_ORDER_REQUESTED,
        };
        expect(order_reducer_1.default(initialState, action)).toEqual(expect.objectContaining({
            statuses: { isSubmitting: true },
        }));
    });
    it('returns new data if it is submitted successfully', function () {
        var response = orders_mock_1.getSubmitOrderResponseBody();
        var headers = orders_mock_1.getSubmitOrderResponseHeaders();
        var action = {
            type: orderActionTypes.SUBMIT_ORDER_SUCCEEDED,
            meta: tslib_1.__assign({}, response.meta, { token: headers.token }),
            payload: response.data,
        };
        expect(order_reducer_1.default(initialState, action)).toEqual(expect.objectContaining({
            meta: expect.objectContaining({
                deviceFingerprint: response.meta.deviceFingerprint,
                token: headers.token,
            }),
            data: action.payload.order,
            statuses: { isSubmitting: false },
        }));
    });
    it('returns new data if it is not submitted successfully', function () {
        var response = errors_mock_1.getErrorResponseBody();
        var action = {
            type: orderActionTypes.SUBMIT_ORDER_FAILED,
            payload: response.data,
        };
        expect(order_reducer_1.default(initialState, action)).toEqual(expect.objectContaining({
            errors: { submitError: action.payload },
            statuses: { isSubmitting: false },
        }));
    });
    it('returns new data while finalizing order', function () {
        var action = {
            type: orderActionTypes.FINALIZE_ORDER_REQUESTED,
        };
        expect(order_reducer_1.default(initialState, action)).toEqual(expect.objectContaining({
            statuses: { isFinalizing: true },
        }));
    });
    it('returns new data if it is finalized successfully', function () {
        var response = orders_mock_1.getCompleteOrderResponseBody();
        var action = {
            type: orderActionTypes.FINALIZE_ORDER_SUCCEEDED,
            meta: response.meta,
            payload: response.data,
        };
        expect(order_reducer_1.default(initialState, action)).toEqual(expect.objectContaining({
            data: action.payload.order,
            statuses: { isFinalizing: false },
        }));
    });
    it('returns new data if it is not finalized successfully', function () {
        var response = errors_mock_1.getErrorResponseBody();
        var action = {
            type: orderActionTypes.FINALIZE_ORDER_FAILED,
            payload: response.data,
        };
        expect(order_reducer_1.default(initialState, action)).toEqual(expect.objectContaining({
            errors: { finalizeError: action.payload },
            statuses: { isFinalizing: false },
        }));
    });
});
//# sourceMappingURL=order-reducer.spec.js.map