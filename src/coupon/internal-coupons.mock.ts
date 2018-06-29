import { getCart } from '../cart/internal-carts.mock';

import InternalCoupon from './internal-coupon';

export function getCoupon(): InternalCoupon {
    return {
        code: 'savebig2015',
        discount: '20% off each item',
        discountType: 1,
    };
}

export function getCouponResponseBody() {
    return {
        data: {
            cart: getCart(),
        },
        meta: {},
    };
}
