import { isEqual, omit } from 'lodash';
import { omitPrivate } from '../common/utility';

export default class CartComparator {
    /**
     * @param {InternalCart} cartA
     * @param {InternalCart} cartB
     * @return {boolean}
     */
    isEqual(cartA, cartB) {
        return isEqual(
            this._normalize(cartA),
            this._normalize(cartB)
        );
    }

    /**
     * @param {InternalCart} cart
     * @return {InternalCart}
     */
    _normalize(cart) {
        return omitPrivate({
            ...cart,
            items: cart.items && cart.items.map(
                item => omit(item, ['id', 'imageUrl'])
            ),
        });
    }
}
