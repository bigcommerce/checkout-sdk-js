"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var payment_methods_mock_1 = require("./payment-methods.mock");
var errors_mock_1 = require("../common/error/errors.mock");
var payment_method_reducer_1 = require("./payment-method-reducer");
var actionTypes = require("./payment-method-action-types");
describe('paymentMethodReducer()', function () {
    var initialState;
    beforeEach(function () {
        initialState = {
            data: [],
        };
    });
    it('returns new state when loading payment methods', function () {
        var action = {
            type: actionTypes.LOAD_PAYMENT_METHODS_REQUESTED,
        };
        expect(payment_method_reducer_1.default(initialState, action)).toEqual(tslib_1.__assign({}, initialState, { errors: {}, statuses: { isLoading: true } }));
    });
    it('returns new state when payment methods are loaded', function () {
        var response = payment_methods_mock_1.getPaymentMethodsResponseBody();
        var action = {
            type: actionTypes.LOAD_PAYMENT_METHODS_SUCCEEDED,
            payload: response.data,
        };
        expect(payment_method_reducer_1.default(initialState, action)).toEqual(tslib_1.__assign({}, initialState, { data: action.payload.paymentMethods, errors: { loadError: undefined }, statuses: { isLoading: false } }));
    });
    it('returns new state when payment methods cannot be loaded', function () {
        var action = {
            type: actionTypes.LOAD_PAYMENT_METHODS_FAILED,
            payload: errors_mock_1.getErrorResponseBody(),
        };
        expect(payment_method_reducer_1.default(initialState, action)).toEqual(tslib_1.__assign({}, initialState, { errors: { loadError: action.payload }, statuses: { isLoading: false } }));
    });
    it('returns new state when payment method is loaded', function () {
        var response = payment_methods_mock_1.getPaymentMethodResponseBody();
        var action = {
            type: actionTypes.LOAD_PAYMENT_METHOD_SUCCEEDED,
            payload: response.data,
            meta: { methodId: 'braintree' },
        };
        expect(payment_method_reducer_1.default(initialState, action)).toEqual(tslib_1.__assign({}, initialState, { data: [
                action.payload.paymentMethod,
            ], errors: {
                failedMethod: undefined,
                loadMethodError: undefined,
            }, statuses: {
                isLoadingMethod: false,
                loadingMethod: undefined,
            } }));
    });
    it('returns new state when payment method cannot be loaded', function () {
        var action = {
            type: actionTypes.LOAD_PAYMENT_METHOD_FAILED,
            payload: errors_mock_1.getErrorResponseBody(),
            meta: { methodId: 'braintree' },
        };
        expect(payment_method_reducer_1.default(initialState, action)).toEqual(tslib_1.__assign({}, initialState, { data: [], errors: {
                failedMethod: 'braintree',
                loadMethodError: errors_mock_1.getErrorResponseBody(),
            }, statuses: {
                isLoadingMethod: false,
                loadingMethod: undefined,
            } }));
    });
    it('returns new state when payment method is loaded and merged with existing payment methods', function () {
        var response = payment_methods_mock_1.getPaymentMethodResponseBody();
        var action = {
            type: actionTypes.LOAD_PAYMENT_METHOD_SUCCEEDED,
            payload: tslib_1.__assign({}, response.data, { paymentMethod: tslib_1.__assign({}, response.data.paymentMethod, { clientToken: '8e738db9-6477-4c92-888e-bea8f1311339' }) }),
        };
        initialState = {
            data: [
                payment_methods_mock_1.getPaymentMethod(),
                payment_methods_mock_1.getBraintreePaypal(),
            ],
        };
        expect(payment_method_reducer_1.default(initialState, action)).toEqual(expect.objectContaining(tslib_1.__assign({}, initialState, { data: [
                action.payload.paymentMethod,
                payment_methods_mock_1.getBraintreePaypal(),
            ] })));
    });
});
//# sourceMappingURL=payment-method-reducer.spec.js.map