import { Coupon } from 'packages/payment-integration/src/coupon';

export function getCoupon(): Coupon {
    return {
        code: 'savebig2015',
        displayName: '20% off each item',
        couponType: 'percentage_discount',
        discountedAmount: 5,
        id: '1',
    };
};
