import Coupon from './coupon';

export function getCoupon(): Coupon {
    return {
        code: 'savebig2015',
        description: '20% off each item',
        couponType: 'percentage_discount',
        discountedAmount: 5,
    };
}
