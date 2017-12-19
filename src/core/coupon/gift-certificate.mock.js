import { getCart } from '../cart/carts.mock';

export function getGiftCertificateResponseBody() {
    return {
        data: {
            cart: getCart(),
        },
        meta: {},
    };
}
