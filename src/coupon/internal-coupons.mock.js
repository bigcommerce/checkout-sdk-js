import { getCart } from '../cart/internal-carts.mock';

export function getCoupon() {
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
