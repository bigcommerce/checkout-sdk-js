"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var rxjs_1 = require("rxjs");
var coupon_mock_1 = require("./coupon.mock");
var errors_mock_1 = require("../common/error/errors.mock");
var responses_mock_1 = require("../../http-request/responses.mock");
var actionTypes = require("./coupon-action-types");
var create_checkout_store_1 = require("../create-checkout-store");
var coupon_action_creator_1 = require("./coupon-action-creator");
describe('CouponActionCreator', function () {
    var checkoutClient;
    var couponActionCreator;
    var errorResponse;
    var response;
    var store;
    beforeEach(function () {
        response = responses_mock_1.getResponse(coupon_mock_1.getCouponResponseBody());
        errorResponse = responses_mock_1.getErrorResponse(errors_mock_1.getErrorResponseBody());
        store = create_checkout_store_1.default();
        checkoutClient = {
            applyCoupon: jest.fn(function () { return Promise.resolve(response); }),
            removeCoupon: jest.fn(function () { return Promise.resolve(response); }),
        };
        couponActionCreator = new coupon_action_creator_1.default(checkoutClient);
    });
    describe('#applyCoupon()', function () {
        beforeEach(function () {
            jest.spyOn(store, 'dispatch');
        });
        it('emits actions if able to apply coupon', function () {
            var coupon = 'myCouponCode1234';
            couponActionCreator.applyCoupon(coupon)
                .toArray()
                .subscribe(function (actions) {
                expect(actions).toEqual([
                    { type: actionTypes.APPLY_COUPON_REQUESTED },
                    { type: actionTypes.APPLY_COUPON_SUCCEEDED, payload: response.body.data },
                ]);
            });
        });
        it('emits error actions if unable to apply coupon', function () {
            checkoutClient.applyCoupon.mockReturnValue(Promise.reject(errorResponse));
            var coupon = 'myCouponCode1234';
            var errorHandler = jest.fn(function (action) { return rxjs_1.Observable.of(action); });
            couponActionCreator.applyCoupon(coupon)
                .catch(errorHandler)
                .toArray()
                .subscribe(function (actions) {
                expect(errorHandler).toHaveBeenCalled();
                expect(actions).toEqual([
                    { type: actionTypes.APPLY_COUPON_REQUESTED },
                    { type: actionTypes.APPLY_COUPON_FAILED, payload: errorResponse, error: true },
                ]);
            });
        });
    });
    describe('#removeCoupon()', function () {
        beforeEach(function () {
            jest.spyOn(store, 'dispatch');
        });
        it('emits actions if able to remove coupon', function () {
            var coupon = 'myCouponCode1234';
            couponActionCreator.removeCoupon(coupon)
                .toArray()
                .subscribe(function (actions) {
                expect(actions).toEqual([
                    { type: actionTypes.REMOVE_COUPON_REQUESTED },
                    { type: actionTypes.REMOVE_COUPON_SUCCEEDED, payload: response.body.data },
                ]);
            });
        });
        it('emits error actions if unable to remove coupon', function () {
            checkoutClient.removeCoupon.mockReturnValue(Promise.reject(errorResponse));
            var coupon = 'myCouponCode1234';
            var errorHandler = jest.fn(function (action) { return rxjs_1.Observable.of(action); });
            couponActionCreator.removeCoupon(coupon)
                .catch(errorHandler)
                .toArray()
                .subscribe(function (actions) {
                expect(errorHandler).toHaveBeenCalled();
                expect(actions).toEqual([
                    { type: actionTypes.REMOVE_COUPON_REQUESTED },
                    { type: actionTypes.REMOVE_COUPON_FAILED, payload: errorResponse, error: true },
                ]);
            });
        });
    });
});
//# sourceMappingURL=coupon-action-creator.spec.js.map