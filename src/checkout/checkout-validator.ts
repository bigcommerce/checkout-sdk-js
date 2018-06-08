import { mapToInternalCart } from '../cart';
import CartComparator from '../cart/cart-comparator';
import { CartChangedError } from '../cart/errors';
import InternalCart from '../cart/internal-cart';
import { MissingDataError } from '../common/error/errors';
import { RequestOptions } from '../common/http-request';

import CheckoutRequestSender from './checkout-request-sender';

export default class CheckoutValidator {
    constructor(
        private _checkoutRequestSender: CheckoutRequestSender
    ) {}

    validate(cart?: InternalCart, options?: RequestOptions): Promise<void> {
        if (!cart) {
            throw new MissingDataError();
        }

        return this._checkoutRequestSender.loadCheckout(cart.id, options)
            .then(response => {
                const comparator = new CartComparator();
                const serverCart = mapToInternalCart(response.body);

                if (cart && comparator.isEqual(cart, serverCart)) {
                    return;
                }

                throw new CartChangedError();
            });
    }
}
