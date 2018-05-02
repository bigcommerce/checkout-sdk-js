import Coupon from './coupon';

export function getCoupon(): Coupon {
    return {
        code: 'savebig2015',
        description: '20% off each item',
        couponType: 'percentage_discount',
        discountedAmount: 5,
        id: '1',
    };
}

export function getShippingCoupon(): Coupon {
    return {
        code: '279F507D817E3E7',
        description: '$5.00 off the shipping total',
        couponType: 'shipping_discount',
        discountedAmount: 5,
        id: '4',
    };
}
