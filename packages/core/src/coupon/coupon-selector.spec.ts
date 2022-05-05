import { RequestError } from '../common/error/errors';

import CouponSelector, { createCouponSelectorFactory, CouponSelectorFactory } from './coupon-selector';
import CouponState from './coupon-state';

describe('CouponSelector', () => {
    let couponSelector: CouponSelector;
    let createCouponSelector: CouponSelectorFactory;
    let state: CouponState;

    beforeEach(() => {
        createCouponSelector = createCouponSelectorFactory();
        state = {
            errors: {},
            statuses: {},
        };
    });

    describe('#getApplyError()', () => {
        it('returns error if unable to apply', () => {
            const applyCouponError = new RequestError();

            couponSelector = createCouponSelector({
                ...state,
                errors: { applyCouponError },
            });

            expect(couponSelector.getApplyError()).toEqual(applyCouponError);
        });

        it('does not returns error if able to apply', () => {
            couponSelector = createCouponSelector(state);

            expect(couponSelector.getApplyError()).toBeUndefined();
        });
    });

    describe('#isApplying()', () => {
        it('returns true if applying a coupon', () => {
            couponSelector = createCouponSelector({
                ...state,
                statuses: { isApplyingCoupon: true },
            });

            expect(couponSelector.isApplying()).toEqual(true);
        });

        it('returns false if not applying a coupon', () => {
            couponSelector = createCouponSelector(state);

            expect(couponSelector.isApplying()).toEqual(false);
        });
    });

    describe('#getRemoveError()', () => {
        it('returns error if unable to remove', () => {
            const removeCouponError = new RequestError();

            couponSelector = createCouponSelector({
                ...state,
                errors: { removeCouponError },
            });

            expect(couponSelector.getRemoveError()).toEqual(removeCouponError);
        });

        it('does not returns error if able to remove', () => {
            couponSelector = createCouponSelector(state);

            expect(couponSelector.getRemoveError()).toBeUndefined();
        });
    });

    describe('#isRemoving()', () => {
        it('returns true if removing a coupon', () => {
            couponSelector = createCouponSelector({
                ...state,
                statuses: { isRemovingCoupon: true },
            });

            expect(couponSelector.isRemoving()).toEqual(true);
        });

        it('returns false if not removing a coupon', () => {
            couponSelector = createCouponSelector(state);

            expect(couponSelector.isRemoving()).toEqual(false);
        });
    });
});
