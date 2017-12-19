"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var customers_mock_1 = require("./customers.mock");
var errors_mock_1 = require("../common/error/errors.mock");
var customer_selector_1 = require("./customer-selector");
describe('CustomerSelector', function () {
    var customerSelector;
    var state;
    beforeEach(function () {
        state = {
            customer: {
                data: customers_mock_1.getGuestCustomer(),
            },
        };
    });
    describe('#getCustomer()', function () {
        it('returns the current customer', function () {
            customerSelector = new customer_selector_1.default(state.customer);
            expect(customerSelector.getCustomer()).toEqual(state.customer.data);
        });
    });
    describe('#getSignInError()', function () {
        it('returns error if unable to sign in', function () {
            var signInError = errors_mock_1.getErrorResponseBody();
            customerSelector = new customer_selector_1.default(tslib_1.__assign({}, state.customer, { errors: { signInError: signInError } }));
            expect(customerSelector.getSignInError()).toEqual(signInError);
        });
        it('does not returns error if able to sign in', function () {
            customerSelector = new customer_selector_1.default(state.order);
            expect(customerSelector.getSignInError()).toBeUndefined();
        });
    });
    describe('#getSignOutError()', function () {
        it('returns error if unable to sign out', function () {
            var signOutError = errors_mock_1.getErrorResponseBody();
            customerSelector = new customer_selector_1.default(tslib_1.__assign({}, state.customer, { errors: { signOutError: signOutError } }));
            expect(customerSelector.getSignOutError()).toEqual(signOutError);
        });
        it('does not returns error if able to sign out', function () {
            customerSelector = new customer_selector_1.default(state.order);
            expect(customerSelector.getSignOutError()).toBeUndefined();
        });
    });
    describe('#isSigningIn()', function () {
        it('returns true if signing in', function () {
            customerSelector = new customer_selector_1.default(tslib_1.__assign({}, state.customer, { statuses: { isSigningIn: true } }));
            expect(customerSelector.isSigningIn()).toEqual(true);
        });
        it('returns false if not signing in', function () {
            customerSelector = new customer_selector_1.default(state.order);
            expect(customerSelector.isSigningIn()).toEqual(false);
        });
    });
    describe('#isSigningOut()', function () {
        it('returns true if signing out', function () {
            customerSelector = new customer_selector_1.default(tslib_1.__assign({}, state.customer, { statuses: { isSigningOut: true } }));
            expect(customerSelector.isSigningOut()).toEqual(true);
        });
        it('returns false if not signing out', function () {
            customerSelector = new customer_selector_1.default(state.order);
            expect(customerSelector.isSigningOut()).toEqual(false);
        });
    });
});
//# sourceMappingURL=customer-selector.spec.js.map