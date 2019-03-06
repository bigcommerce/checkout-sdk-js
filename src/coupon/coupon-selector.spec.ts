import { RequestError } from '../common/error/errors';

import CouponSelector from './coupon-selector';
import CouponState from './coupon-state';

describe('CouponSelector', () => {
    let couponSelector: CouponSelector;
    let state: CouponState;

    beforeEach(() => {
        state = {
            errors: {},
            statuses: {},
        };
    });

    describe('#getApplyError()', () => {
        it('returns error if unable to apply', () => {
            const applyCouponError = new RequestError();

            couponSelector = new CouponSelector({
                ...state,
                errors: { applyCouponError },
            });

            expect(couponSelector.getApplyError()).toEqual(applyCouponError);
        });

        it('does not returns error if able to apply', () => {
            couponSelector = new CouponSelector(state);

            expect(couponSelector.getApplyError()).toBeUndefined();
        });
    });

    describe('#isApplying()', () => {
        it('returns true if applying a coupon', () => {
            couponSelector = new CouponSelector({
                ...state,
                statuses: { isApplyingCoupon: true },
            });

            expect(couponSelector.isApplying()).toEqual(true);
        });

        it('returns false if not applying a coupon', () => {
            couponSelector = new CouponSelector(state);

            expect(couponSelector.isApplying()).toEqual(false);
        });
    });

    describe('#getRemoveError()', () => {
        it('returns error if unable to remove', () => {
            const removeCouponError = new RequestError();

            couponSelector = new CouponSelector({
                ...state,
                errors: { removeCouponError },
            });

            expect(couponSelector.getRemoveError()).toEqual(removeCouponError);
        });

        it('does not returns error if able to remove', () => {
            couponSelector = new CouponSelector(state);

            expect(couponSelector.getRemoveError()).toBeUndefined();
        });
    });

    describe('#isRemoving()', () => {
        it('returns true if removing a coupon', () => {
            couponSelector = new CouponSelector({
                ...state,
                statuses: { isRemovingCoupon: true },
            });

            expect(couponSelector.isRemoving()).toEqual(true);
        });

        it('returns false if not removing a coupon', () => {
            couponSelector = new CouponSelector(state);

            expect(couponSelector.isRemoving()).toEqual(false);
        });
    });
});
