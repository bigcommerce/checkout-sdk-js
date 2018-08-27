import Coupon from './coupon';
import CouponState from './coupon-state';

export function getCoupon(): Coupon {
    return {
        code: 'savebig2015',
        displayName: '20% off each item',
        couponType: 'percentage_discount',
        discountedAmount: 5,
        id: '1',
    };
}

export function getShippingCoupon(): Coupon {
    return {
        code: '279F507D817E3E7',
        displayName: '$5.00 off the shipping total',
        couponType: 'shipping_discount',
        discountedAmount: 5,
        id: '4',
    };
}

export function getCouponsState(): CouponState {
    return {
        data: [
            getCoupon(),
            getShippingCoupon(),
        ],
        errors: {},
        statuses: {},
    };
}
