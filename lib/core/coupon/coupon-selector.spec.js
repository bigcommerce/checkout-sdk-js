"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var errors_mock_1 = require("../common/error/errors.mock");
var coupon_selector_1 = require("./coupon-selector");
describe('CouponSelector', function () {
    var couponSelector;
    var state;
    beforeEach(function () {
        state = {};
    });
    describe('#getApplyError()', function () {
        it('returns error if unable to apply', function () {
            var applyCouponError = errors_mock_1.getErrorResponseBody();
            couponSelector = new coupon_selector_1.default(tslib_1.__assign({}, state.quote, { errors: { applyCouponError: applyCouponError } }));
            expect(couponSelector.getApplyError()).toEqual(applyCouponError);
        });
        it('does not returns error if able to apply', function () {
            couponSelector = new coupon_selector_1.default(state.quote);
            expect(couponSelector.getApplyError()).toBeUndefined();
        });
    });
    describe('#isApplying()', function () {
        it('returns true if applying a coupon', function () {
            couponSelector = new coupon_selector_1.default(tslib_1.__assign({}, state.quote, { statuses: { isApplyingCoupon: true } }));
            expect(couponSelector.isApplying()).toEqual(true);
        });
        it('returns false if not applying a coupon', function () {
            couponSelector = new coupon_selector_1.default(state.quote);
            expect(couponSelector.isApplying()).toEqual(false);
        });
    });
    describe('#getRemoveError()', function () {
        it('returns error if unable to remove', function () {
            var removeCouponError = errors_mock_1.getErrorResponseBody();
            couponSelector = new coupon_selector_1.default(tslib_1.__assign({}, state.quote, { errors: { removeCouponError: removeCouponError } }));
            expect(couponSelector.getRemoveError()).toEqual(removeCouponError);
        });
        it('does not returns error if able to remove', function () {
            couponSelector = new coupon_selector_1.default(state.quote);
            expect(couponSelector.getRemoveError()).toBeUndefined();
        });
    });
    describe('#isRemoving()', function () {
        it('returns true if removing a coupon', function () {
            couponSelector = new coupon_selector_1.default(tslib_1.__assign({}, state.quote, { statuses: { isRemovingCoupon: true } }));
            expect(couponSelector.isRemoving()).toEqual(true);
        });
        it('returns false if not removing a coupon', function () {
            couponSelector = new coupon_selector_1.default(state.quote);
            expect(couponSelector.isRemoving()).toEqual(false);
        });
    });
});
//# sourceMappingURL=coupon-selector.spec.js.map