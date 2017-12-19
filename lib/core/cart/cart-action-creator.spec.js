"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var rxjs_1 = require("rxjs");
var carts_mock_1 = require("./carts.mock");
var errors_mock_1 = require("../common/error/errors.mock");
var responses_mock_1 = require("../../http-request/responses.mock");
var actionTypes = require("./cart-action-types");
var cart_action_creator_1 = require("./cart-action-creator");
describe('CartActionCreator', function () {
    var cartActionCreator;
    var checkoutClient;
    var errorResponse;
    var response;
    beforeEach(function () {
        response = responses_mock_1.getResponse(carts_mock_1.getCartResponseBody());
        errorResponse = responses_mock_1.getErrorResponse(errors_mock_1.getErrorResponseBody());
        checkoutClient = {
            loadCart: jest.fn(function () { return Promise.resolve(response); }),
        };
        cartActionCreator = new cart_action_creator_1.default(checkoutClient);
    });
    describe('#loadCart()', function () {
        it('emits actions if able load cart', function () {
            cartActionCreator.loadCart()
                .toArray()
                .subscribe(function (actions) {
                expect(actions).toEqual([
                    { type: actionTypes.LOAD_CART_REQUESTED },
                    { type: actionTypes.LOAD_CART_SUCCEEDED, meta: response.body.meta, payload: response.body.data },
                ]);
            });
        });
        it('emits error actions if unable load cart', function () {
            checkoutClient.loadCart.mockReturnValue(Promise.reject(errorResponse));
            var errorHandler = jest.fn(function (action) { return rxjs_1.Observable.of(action); });
            cartActionCreator.loadCart()
                .catch(errorHandler)
                .toArray()
                .subscribe(function (actions) {
                expect(errorHandler).toHaveBeenCalled();
                expect(actions).toEqual([
                    { type: actionTypes.LOAD_CART_REQUESTED },
                    { type: actionTypes.LOAD_CART_FAILED, payload: errorResponse, error: true },
                ]);
            });
        });
    });
    describe('#verifyCart()', function () {
        it('emits `false` if cart content has not changed', function () {
            cartActionCreator.verifyCart(carts_mock_1.getCart())
                .toArray()
                .subscribe(function (actions) {
                expect(actions).toEqual([
                    { type: actionTypes.VERIFY_CART_REQUESTED },
                    { type: actionTypes.VERIFY_CART_SUCCEEDED, payload: false },
                ]);
            });
        });
        it('emits `true` if cart content has changed', function () {
            cartActionCreator.verifyCart(tslib_1.__assign({}, carts_mock_1.getCart(), { currency: 'JPY' }))
                .toArray()
                .subscribe(function (actions) {
                expect(actions).toEqual([
                    { type: actionTypes.VERIFY_CART_REQUESTED },
                    { type: actionTypes.VERIFY_CART_SUCCEEDED, payload: true },
                ]);
            });
        });
        it('emits error actions if unable to verify cart', function () {
            checkoutClient.loadCart.mockReturnValue(Promise.reject(errorResponse));
            var errorHandler = jest.fn(function (action) { return rxjs_1.Observable.of(action); });
            cartActionCreator.verifyCart()
                .catch(errorHandler)
                .toArray()
                .subscribe(function (actions) {
                expect(actions).toEqual([
                    { type: actionTypes.VERIFY_CART_REQUESTED },
                    { type: actionTypes.VERIFY_CART_FAILED, payload: errorResponse, error: true },
                ]);
            });
        });
    });
    describe('#updateCart()', function () {
        it('returns action updating cart', function () {
            var data = carts_mock_1.getCartResponseBody().data;
            var action = cartActionCreator.updateCart(data);
            expect(action).toEqual({
                type: actionTypes.CART_UPDATED,
                payload: data,
            });
        });
    });
});
//# sourceMappingURL=cart-action-creator.spec.js.map