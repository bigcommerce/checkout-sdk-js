import { createAction, createErrorAction } from '@bigcommerce/data-store';

import { CheckoutActionType } from '../checkout';
import { getCheckout, getCheckoutWithCoupons } from '../checkout/checkouts.mock';
import { StorefrontErrorResponseBody } from '../common/error';
import { RequestError } from '../common/error/errors';
import { getErrorResponse } from '../common/http-request/responses.mock';
import { OrderActionType } from '../order';
import { getOrder } from '../order/orders.mock';

import { CouponActionType } from './coupon-actions';
import couponReducer from './coupon-reducer';
import CouponState from './coupon-state';

describe('couponReducer()', () => {
    const initialState: CouponState = { errors: {}, statuses: {} };

    it('returns new state when coupon gets applied', () => {
        const action = createAction(CouponActionType.ApplyCouponSucceeded, getCheckoutWithCoupons());

        expect(couponReducer(initialState, action)).toEqual(expect.objectContaining({
            data: action.payload && action.payload.coupons,
        }));
    });

    it('returns new state when coupon gets removed', () => {
        const action = createAction(CouponActionType.RemoveCouponSucceeded, getCheckout());

        expect(couponReducer(initialState, action)).toEqual(expect.objectContaining({
            data: [],
        }));
    });

    it('returns new state when checkout gets loaded', () => {
        const action = createAction(CheckoutActionType.LoadCheckoutSucceeded, getCheckoutWithCoupons());

        expect(couponReducer(initialState, action)).toEqual(expect.objectContaining({
            data: action.payload && action.payload.coupons,
        }));
    });

    it('returns new state when order gets loaded', () => {
        const action = createAction(OrderActionType.LoadOrderSucceeded, getOrder());

        expect(couponReducer(initialState, action)).toEqual(expect.objectContaining({
            data: action.payload && action.payload.coupons,
        }));
    });

    it('returns an error state if coupon failed to be applied', () => {
        const errorResponseBody: StorefrontErrorResponseBody = {
            title: '',
            detail: '',
            type: '',
            status: 400,
        };

        const action = createErrorAction(
            CouponActionType.ApplyCouponFailed,
            new RequestError(getErrorResponse(errorResponseBody))
        );

        expect(couponReducer(initialState, action)).toEqual(expect.objectContaining({
            errors: { applyCouponError: action.payload },
            statuses: { isApplyingCoupon: false },
        }));
    });

    it('returns an error state if coupon failed to be removed', () => {
        const action = createErrorAction(CouponActionType.RemoveCouponFailed, new RequestError(getErrorResponse()));

        expect(couponReducer(initialState, action)).toEqual(expect.objectContaining({
            errors: { removeCouponError: action.payload },
            statuses: { isRemovingCoupon: false },
        }));
    });

    it('returns new state while applying a coupon', () => {
        const action = createAction(CouponActionType.ApplyCouponRequested);

        expect(couponReducer(initialState, action)).toEqual(expect.objectContaining({
            statuses: { isApplyingCoupon: true },
        }));
    });

    it('returns new state while removing a coupon', () => {
        const action = createAction(CouponActionType.RemoveCouponRequested);

        expect(couponReducer(initialState, action)).toEqual(expect.objectContaining({
            statuses: { isRemovingCoupon: true },
        }));
    });
});
