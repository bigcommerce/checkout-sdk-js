import { getCart } from '../cart/carts.mock';

export function getCouponResponseBody() {
    return {
        data: {
            cart: getCart(),
        },
        meta: {},
    };
}
