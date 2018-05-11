import { getErrorResponse } from '../common/http-request/responses.mock';
import CouponSelector from './coupon-selector';

describe('CouponSelector', () => {
    let couponSelector;
    let state;

    beforeEach(() => {
        state = {
            coupons: {
                errors: {},
                statuses: {},
            },
        };
    });

    describe('#getApplyError()', () => {
        it('returns error if unable to apply', () => {
            const applyCouponError = getErrorResponse();

            couponSelector = new CouponSelector({
                ...state.coupons,
                errors: { applyCouponError },
            });

            expect(couponSelector.getApplyError()).toEqual(applyCouponError);
        });

        it('does not returns error if able to apply', () => {
            couponSelector = new CouponSelector(state.coupons);

            expect(couponSelector.getApplyError()).toBeUndefined();
        });
    });

    describe('#isApplying()', () => {
        it('returns true if applying a coupon', () => {
            couponSelector = new CouponSelector({
                ...state.coupons,
                statuses: { isApplyingCoupon: true },
            });

            expect(couponSelector.isApplying()).toEqual(true);
        });

        it('returns false if not applying a coupon', () => {
            couponSelector = new CouponSelector(state.coupons);

            expect(couponSelector.isApplying()).toEqual(false);
        });
    });

    describe('#getRemoveError()', () => {
        it('returns error if unable to remove', () => {
            const removeCouponError = getErrorResponse();

            couponSelector = new CouponSelector({
                ...state.coupons,
                errors: { removeCouponError },
            });

            expect(couponSelector.getRemoveError()).toEqual(removeCouponError);
        });

        it('does not returns error if able to remove', () => {
            couponSelector = new CouponSelector(state.coupons);

            expect(couponSelector.getRemoveError()).toBeUndefined();
        });
    });

    describe('#isRemoving()', () => {
        it('returns true if removing a coupon', () => {
            couponSelector = new CouponSelector({
                ...state.coupons,
                statuses: { isRemovingCoupon: true },
            });

            expect(couponSelector.isRemoving()).toEqual(true);
        });

        it('returns false if not removing a coupon', () => {
            couponSelector = new CouponSelector(state.coupons);

            expect(couponSelector.isRemoving()).toEqual(false);
        });
    });
});
