import { getCart } from '../cart/internal-carts.mock';

export function getGiftCertificateResponseBody() {
    return {
        data: {
            cart: getCart(),
        },
        meta: {},
    };
}
