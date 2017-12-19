"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var lodash_1 = require("lodash");
var payment_methods_mock_1 = require("./payment-methods.mock");
var orders_mock_1 = require("../order/orders.mock");
var errors_mock_1 = require("../common/error/errors.mock");
var payment_method_selector_1 = require("./payment-method-selector");
describe('PaymentMethodSelector', function () {
    var paymentMethodSelector;
    var state;
    beforeEach(function () {
        state = {
            paymentMethods: payment_methods_mock_1.getPaymentMethodsState(),
            order: orders_mock_1.getSubmittedOrderState(),
        };
    });
    describe('#getPaymentMethods()', function () {
        it('returns a list of payment methods', function () {
            paymentMethodSelector = new payment_method_selector_1.default(state.paymentMethods, state.order);
            expect(paymentMethodSelector.getPaymentMethods()).toEqual(state.paymentMethods.data);
        });
        it('returns an empty array if there are no payment methods', function () {
            paymentMethodSelector = new payment_method_selector_1.default(tslib_1.__assign({}, state.paymentMethods, { data: [] }), state.order);
            expect(paymentMethodSelector.getPaymentMethods()).toEqual([]);
        });
    });
    describe('#getPaymentMethod()', function () {
        it('returns payment method if found', function () {
            paymentMethodSelector = new payment_method_selector_1.default(state.paymentMethods, state.order);
            expect(paymentMethodSelector.getPaymentMethod('braintree')).toEqual(payment_methods_mock_1.getBraintree());
        });
        it('returns multi-option payment method if found', function () {
            paymentMethodSelector = new payment_method_selector_1.default(state.paymentMethods, state.order);
            expect(paymentMethodSelector.getPaymentMethod('amex', 'adyen')).toEqual(payment_methods_mock_1.getAdyenAmex());
        });
        it('returns nothing if payment method is not found', function () {
            paymentMethodSelector = new payment_method_selector_1.default(state.paymentMethods, state.order);
            expect(paymentMethodSelector.getPaymentMethod('xyz')).toBeUndefined();
        });
        it('returns nothing if multi-option payment method is not found', function () {
            paymentMethodSelector = new payment_method_selector_1.default(state.paymentMethods, state.order);
            expect(paymentMethodSelector.getPaymentMethod('amex')).toEqual(payment_methods_mock_1.getAdyenAmex());
        });
    });
    describe('#getSelectedPaymentMethod()', function () {
        it('returns selected payment method', function () {
            paymentMethodSelector = new payment_method_selector_1.default(state.paymentMethods, state.order);
            expect(paymentMethodSelector.getSelectedPaymentMethod()).toEqual(lodash_1.find(state.paymentMethods.data, { id: state.order.data.payment.id }));
        });
        it('returns undefined if payment method is not selected', function () {
            paymentMethodSelector = new payment_method_selector_1.default(state.paymentMethods, lodash_1.merge({}, state.order, {
                data: {
                    payment: null,
                },
            }));
            expect(paymentMethodSelector.getSelectedPaymentMethod()).toEqual();
        });
    });
    describe('#getLoadError()', function () {
        it('returns error if unable to load', function () {
            var loadError = errors_mock_1.getErrorResponseBody();
            paymentMethodSelector = new payment_method_selector_1.default(tslib_1.__assign({}, state.paymentMethods, { errors: { loadError: loadError } }), state.order);
            expect(paymentMethodSelector.getLoadError()).toEqual(loadError);
        });
        it('does not returns error if able to load', function () {
            paymentMethodSelector = new payment_method_selector_1.default(state.paymentMethods, state.order);
            expect(paymentMethodSelector.getLoadError()).toBeUndefined();
        });
    });
    describe('#getLoadMethodError()', function () {
        it('returns error if unable to load', function () {
            var loadMethodError = errors_mock_1.getErrorResponseBody();
            paymentMethodSelector = new payment_method_selector_1.default(tslib_1.__assign({}, state.paymentMethods, { errors: { loadMethodError: loadMethodError, failedMethod: 'braintree' } }), state.order);
            expect(paymentMethodSelector.getLoadMethodError('braintree')).toEqual(loadMethodError);
        });
        it('does not returns error if able to load', function () {
            paymentMethodSelector = new payment_method_selector_1.default(state.paymentMethods, state.order);
            expect(paymentMethodSelector.getLoadMethodError('braintree')).toBeUndefined();
        });
        it('does not returns error if unable to load irrelevant method', function () {
            var loadMethodError = errors_mock_1.getErrorResponseBody();
            paymentMethodSelector = new payment_method_selector_1.default(tslib_1.__assign({}, state.paymentMethods, { errors: { loadMethodError: loadMethodError, failedMethod: 'authorizenet' } }), state.order);
            expect(paymentMethodSelector.getLoadMethodError('braintree')).toBeUndefined();
        });
        it('returns any error if method id is not passed', function () {
            var loadMethodError = errors_mock_1.getErrorResponseBody();
            paymentMethodSelector = new payment_method_selector_1.default(tslib_1.__assign({}, state.paymentMethods, { errors: { loadMethodError: loadMethodError, failedMethod: 'braintree' } }), state.order);
            expect(paymentMethodSelector.getLoadMethodError()).toEqual(loadMethodError);
        });
    });
    describe('#isLoading()', function () {
        it('returns true if loading payment methods', function () {
            paymentMethodSelector = new payment_method_selector_1.default(tslib_1.__assign({}, state.paymentMethods, { statuses: { isLoading: true } }), state.order);
            expect(paymentMethodSelector.isLoading()).toEqual(true);
        });
        it('returns false if not loading payment methods', function () {
            paymentMethodSelector = new payment_method_selector_1.default(state.paymentMethods, state.order);
            expect(paymentMethodSelector.isLoading()).toEqual(false);
        });
    });
    describe('#isLoadingMethod()', function () {
        it('returns true if loading payment method', function () {
            paymentMethodSelector = new payment_method_selector_1.default(tslib_1.__assign({}, state.paymentMethods, { statuses: { isLoadingMethod: true, loadingMethod: 'braintree' } }), state.order);
            expect(paymentMethodSelector.isLoadingMethod('braintree')).toEqual(true);
        });
        it('returns false if not loading payment method', function () {
            paymentMethodSelector = new payment_method_selector_1.default(tslib_1.__assign({}, state.paymentMethods, { statuses: { isLoadingMethod: false, loadingMethod: undefined } }), state.order);
            expect(paymentMethodSelector.isLoadingMethod('braintree')).toEqual(false);
        });
        it('returns false if not loading specific payment method', function () {
            paymentMethodSelector = new payment_method_selector_1.default(tslib_1.__assign({}, state.paymentMethods, { statuses: { isLoadingMethod: true, loadingMethod: 'authorizenet' } }), state.order);
            expect(paymentMethodSelector.isLoadingMethod('braintree')).toEqual(false);
        });
        it('returns any loading status if method id is not passed', function () {
            paymentMethodSelector = new payment_method_selector_1.default(tslib_1.__assign({}, state.paymentMethods, { statuses: { isLoadingMethod: true, loadingMethod: 'braintree' } }), state.order);
            expect(paymentMethodSelector.isLoadingMethod()).toEqual(true);
        });
    });
});
//# sourceMappingURL=payment-method-selector.spec.js.map