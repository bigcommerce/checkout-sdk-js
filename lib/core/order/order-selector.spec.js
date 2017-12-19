"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var lodash_1 = require("lodash");
var carts_mock_1 = require("../cart/carts.mock");
var customers_mock_1 = require("../customer/customers.mock");
var orders_mock_1 = require("./orders.mock");
var payments_mock_1 = require("../payment/payments.mock");
var errors_mock_1 = require("../common/error/errors.mock");
var order_selector_1 = require("./order-selector");
describe('OrderSelector', function () {
    var order;
    var orderSelector;
    var state;
    beforeEach(function () {
        order = orders_mock_1.getSubmittedOrder();
        state = {
            cart: carts_mock_1.getCartState(),
            customer: customers_mock_1.getCustomerState(),
            order: orders_mock_1.getSubmittedOrderState(),
            payment: payments_mock_1.getPaymentState(),
        };
    });
    describe('#getOrder()', function () {
        it('returns the current order', function () {
            orderSelector = new order_selector_1.default(state.order, state.payment, state.customer, state.cart);
            expect(orderSelector.getOrder()).toEqual(order);
        });
    });
    describe('#getLoadError()', function () {
        it('returns error if unable to load', function () {
            var loadError = errors_mock_1.getErrorResponseBody();
            orderSelector = new order_selector_1.default(tslib_1.__assign({}, state.order, { errors: { loadError: loadError } }), state.payment, state.customer, state.cart);
            expect(orderSelector.getLoadError()).toEqual(loadError);
        });
        it('does not returns error if able to load', function () {
            orderSelector = new order_selector_1.default(state.order, state.payment, state.customer, state.cart);
            expect(orderSelector.getLoadError()).toBeUndefined();
        });
    });
    describe('#getSubmitError()', function () {
        it('returns error if unable to submit order', function () {
            var submitError = errors_mock_1.getErrorResponseBody();
            orderSelector = new order_selector_1.default(tslib_1.__assign({}, state.order, { errors: { submitError: submitError } }), state.payment, state.customer, state.cart);
            expect(orderSelector.getSubmitError()).toEqual(submitError);
        });
        it('returns error if unable to submit payment', function () {
            var submitError = errors_mock_1.getErrorResponseBody();
            orderSelector = new order_selector_1.default(state.order, tslib_1.__assign({}, state.payment, { errors: { submitError: submitError } }), state.customer, state.cart);
            expect(orderSelector.getSubmitError()).toEqual(submitError);
        });
        it('does not returns error if able to submit order', function () {
            orderSelector = new order_selector_1.default(state.order, state.payment, state.customer, state.cart);
            expect(orderSelector.getSubmitError()).toBeUndefined();
        });
    });
    describe('#getFinalizeError()', function () {
        it('returns error if unable to finalize', function () {
            var finalizeError = errors_mock_1.getErrorResponseBody();
            orderSelector = new order_selector_1.default(tslib_1.__assign({}, state.order, { errors: { finalizeError: finalizeError } }), state.payment, state.customer, state.cart);
            expect(orderSelector.getFinalizeError()).toEqual(finalizeError);
        });
        it('does not returns error if able to load', function () {
            orderSelector = new order_selector_1.default(state.order, state.payment, state.customer, state.cart);
            expect(orderSelector.getFinalizeError()).toBeUndefined();
        });
    });
    describe('#isLoading()', function () {
        it('returns true if loading order', function () {
            orderSelector = new order_selector_1.default(tslib_1.__assign({}, state.order, { statuses: { isLoading: true } }), state.payment, state.customer, state.cart);
            expect(orderSelector.isLoading()).toEqual(true);
        });
        it('returns false if not loading order', function () {
            orderSelector = new order_selector_1.default(state.order, state.payment, state.customer, state.cart);
            expect(orderSelector.isLoading()).toEqual(false);
        });
    });
    describe('#isSubmitting()', function () {
        it('returns true if submitting order', function () {
            orderSelector = new order_selector_1.default(tslib_1.__assign({}, state.order, { statuses: { isSubmitting: true } }), state.payment, state.customer, state.cart);
            expect(orderSelector.isSubmitting()).toEqual(true);
        });
        it('returns true if submitting payment', function () {
            orderSelector = new order_selector_1.default(state.order, tslib_1.__assign({}, state.payment, { statuses: { isSubmitting: true } }), state.customer, state.cart);
            expect(orderSelector.isSubmitting()).toEqual(true);
        });
        it('returns false if not submitting order', function () {
            orderSelector = new order_selector_1.default(state.order, state.payment, state.customer, state.cart);
            expect(orderSelector.isSubmitting()).toEqual(false);
        });
    });
    describe('#isFinalizing()', function () {
        it('returns true if finalizing order', function () {
            orderSelector = new order_selector_1.default(tslib_1.__assign({}, state.order, { statuses: { isFinalizing: true } }), state.payment, state.customer, state.cart);
            expect(orderSelector.isFinalizing()).toEqual(true);
        });
        it('returns false if not finalizing order', function () {
            orderSelector = new order_selector_1.default(state.order, state.payment, state.customer, state.cart);
            expect(orderSelector.isFinalizing()).toEqual(false);
        });
    });
    describe('#isPaymentRequired()', function () {
        it('returns true if payment is required', function () {
            orderSelector = new order_selector_1.default(state.order, state.payment, state.customer, state.cart);
            expect(orderSelector.isPaymentRequired()).toEqual(true);
        });
        it('returns false if store credit exceeds grand total', function () {
            orderSelector = new order_selector_1.default(state.order, state.payment, lodash_1.merge({}, state.customer, {
                data: { storeCredit: 100000000000 },
            }), state.cart);
            expect(orderSelector.isPaymentRequired(true)).toEqual(false);
        });
        it('returns true if store credit exceeds grand total but not using store credit', function () {
            orderSelector = new order_selector_1.default(state.order, state.payment, lodash_1.merge({}, state.customer, {
                data: { storeCredit: 100000000000 },
            }), state.cart);
            expect(orderSelector.isPaymentRequired(false)).toEqual(true);
        });
    });
});
//# sourceMappingURL=order-selector.spec.js.map