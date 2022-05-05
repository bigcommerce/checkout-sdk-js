import { getCoupon } from './coupons.mock';
import { getCoupon as getInternalCoupon } from './internal-coupons.mock';
import mapToInternalCoupon from './map-to-internal-coupon';

describe('mapToInternalCoupon', () => {
    it('maps to internal coupon', () => {
        expect(mapToInternalCoupon(getCoupon()))
            .toEqual(getInternalCoupon());
    });
});
