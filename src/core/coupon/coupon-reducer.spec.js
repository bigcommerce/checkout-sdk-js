import { getCouponResponseBody } from './coupon.mock';
import { getErrorResponse } from '../common/http-request/responses.mock';
import * as couponActionTypes from '../coupon/coupon-action-types';
import couponReducer from './coupon-reducer';

describe('couponReducer()', () => {
    let initialState;

    beforeEach(() => {
        initialState = {};
    });

    it('no data gets stored when a coupon is applied', () => {
        const response = getCouponResponseBody();
        const action = {
            type: couponActionTypes.APPLY_COUPON_SUCCEEDED,
            meta: response.meta,
            payload: response.data,
        };

        expect(couponReducer(initialState, action)).not.toEqual(expect.objectContaining({
            data: {},
        }));
    });

    it('no data gets stored when a coupon is removed', () => {
        const response = getCouponResponseBody();
        const action = {
            type: couponActionTypes.REMOVE_COUPON_SUCCEEDED,
            meta: response.meta,
            payload: response.data,
        };

        expect(couponReducer(initialState, action)).not.toEqual(expect.objectContaining({
            data: {},
        }));
    });

    it('returns an error state if coupon failed to be applied', () => {
        const action = {
            type: couponActionTypes.APPLY_COUPON_FAILED,
            payload: getErrorResponse(),
        };

        expect(couponReducer(initialState, action)).toEqual(expect.objectContaining({
            errors: { applyCouponError: getErrorResponse() },
            statuses: { isApplyingCoupon: false },
        }));
    });

    it('returns an error state if coupon failed to be removed', () => {
        const action = {
            type: couponActionTypes.REMOVE_COUPON_FAILED,
            payload: getErrorResponse(),
        };

        expect(couponReducer(initialState, action)).toEqual(expect.objectContaining({
            errors: { removeCouponError: getErrorResponse() },
            statuses: { isRemovingCoupon: false },
        }));
    });

    it('returns new state while applying a coupon', () => {
        const action = {
            type: couponActionTypes.APPLY_COUPON_REQUESTED,
        };

        expect(couponReducer(initialState, action)).toEqual(expect.objectContaining({
            statuses: { isApplyingCoupon: true },
        }));
    });

    it('returns new state while removing a coupon', () => {
        const action = {
            type: couponActionTypes.REMOVE_COUPON_REQUESTED,
        };

        expect(couponReducer(initialState, action)).toEqual(expect.objectContaining({
            statuses: { isRemovingCoupon: true },
        }));
    });
});
