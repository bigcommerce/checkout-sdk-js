import Coupon from './coupon';

export function getCoupon(): Coupon {
    return {
        id: '2',
        code: 'savebig2015',
        couponType: 'percentage_discount',
        discountedAmount: 10,
    };
}
