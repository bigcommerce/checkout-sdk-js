"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var coupon_mock_1 = require("./coupon.mock");
var errors_mock_1 = require("../common/error/errors.mock");
var couponActionTypes = require("../coupon/coupon-action-types");
var coupon_reducer_1 = require("./coupon-reducer");
describe('couponReducer()', function () {
    var initialState;
    beforeEach(function () {
        initialState = {};
    });
    it('no data gets stored when a coupon is applied', function () {
        var response = coupon_mock_1.getCouponResponseBody();
        var action = {
            type: couponActionTypes.APPLY_COUPON_SUCCEEDED,
            meta: response.meta,
            payload: response.data,
        };
        expect(coupon_reducer_1.default(initialState, action)).not.toEqual(expect.objectContaining({
            data: {},
        }));
    });
    it('no data gets stored when a coupon is removed', function () {
        var response = coupon_mock_1.getCouponResponseBody();
        var action = {
            type: couponActionTypes.REMOVE_COUPON_SUCCEEDED,
            meta: response.meta,
            payload: response.data,
        };
        expect(coupon_reducer_1.default(initialState, action)).not.toEqual(expect.objectContaining({
            data: {},
        }));
    });
    it('returns an error state if coupon failed to be applied', function () {
        var action = {
            type: couponActionTypes.APPLY_COUPON_FAILED,
            payload: errors_mock_1.getErrorResponseBody(),
        };
        expect(coupon_reducer_1.default(initialState, action)).toEqual(expect.objectContaining({
            errors: { applyCouponError: errors_mock_1.getErrorResponseBody() },
            statuses: { isApplyingCoupon: false },
        }));
    });
    it('returns an error state if coupon failed to be removed', function () {
        var action = {
            type: couponActionTypes.REMOVE_COUPON_FAILED,
            payload: errors_mock_1.getErrorResponseBody(),
        };
        expect(coupon_reducer_1.default(initialState, action)).toEqual(expect.objectContaining({
            errors: { removeCouponError: errors_mock_1.getErrorResponseBody() },
            statuses: { isRemovingCoupon: false },
        }));
    });
    it('returns new state while applying a coupon', function () {
        var action = {
            type: couponActionTypes.APPLY_COUPON_REQUESTED,
        };
        expect(coupon_reducer_1.default(initialState, action)).toEqual(expect.objectContaining({
            statuses: { isApplyingCoupon: true },
        }));
    });
    it('returns new state while removing a coupon', function () {
        var action = {
            type: couponActionTypes.REMOVE_COUPON_REQUESTED,
        };
        expect(coupon_reducer_1.default(initialState, action)).toEqual(expect.objectContaining({
            statuses: { isRemovingCoupon: true },
        }));
    });
});
//# sourceMappingURL=coupon-reducer.spec.js.map