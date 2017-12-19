"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var carts_mock_1 = require("./carts.mock");
var errors_mock_1 = require("../common/error/errors.mock");
var cart_selector_1 = require("./cart-selector");
describe('CartSelector', function () {
    var cartSelector;
    var state;
    beforeEach(function () {
        state = {
            cart: {
                meta: {},
                data: carts_mock_1.getCart(),
            },
        };
    });
    describe('#getCart()', function () {
        it('returns the current cart', function () {
            cartSelector = new cart_selector_1.default(state.cart);
            expect(cartSelector.getCart()).toEqual(state.cart.data);
        });
    });
    describe('#getVerifyError()', function () {
        it('returns error if unable to verify', function () {
            var verifyError = errors_mock_1.getErrorResponseBody();
            cartSelector = new cart_selector_1.default(tslib_1.__assign({}, state.cart, { errors: { verifyError: verifyError } }));
            expect(cartSelector.getVerifyError()).toEqual(verifyError);
        });
        it('does not returns error if able to load', function () {
            cartSelector = new cart_selector_1.default(state.verify);
            expect(cartSelector.getVerifyError()).toBeUndefined();
        });
    });
    describe('#getLoadError()', function () {
        it('returns error if unable to load', function () {
            var loadError = errors_mock_1.getErrorResponseBody();
            cartSelector = new cart_selector_1.default(tslib_1.__assign({}, state.cart, { errors: { loadError: loadError } }));
            expect(cartSelector.getLoadError()).toEqual(loadError);
        });
        it('does not returns error if able to load', function () {
            cartSelector = new cart_selector_1.default(state.cart);
            expect(cartSelector.getLoadError()).toBeUndefined();
        });
    });
    describe('#isLoading()', function () {
        it('returns true if loading cart', function () {
            cartSelector = new cart_selector_1.default(tslib_1.__assign({}, state.cart, { statuses: { isLoading: true } }));
            expect(cartSelector.isLoading()).toEqual(true);
        });
        it('returns false if not loading cart', function () {
            cartSelector = new cart_selector_1.default(state.cart);
            expect(cartSelector.isLoading()).toEqual(false);
        });
    });
    describe('#isVerifying()', function () {
        it('returns true if loading cart', function () {
            cartSelector = new cart_selector_1.default(tslib_1.__assign({}, state.cart, { statuses: { isVerifying: true } }));
            expect(cartSelector.isVerifying()).toEqual(true);
        });
        it('returns false if not loading cart', function () {
            cartSelector = new cart_selector_1.default(state.cart);
            expect(cartSelector.isVerifying()).toEqual(false);
        });
    });
});
//# sourceMappingURL=cart-selector.spec.js.map