import InternalCoupon from './internal-coupon';

export function getCoupon(): InternalCoupon {
    return {
        code: 'savebig2015',
        discount: '20% off each item',
        discountType: 1,
    };
}
