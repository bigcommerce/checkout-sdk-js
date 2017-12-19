import { isEqual, omit } from 'lodash';
import { omitPrivate } from '../common/utility';

export default class CartComparator {
    /**
     * @param {Cart} cartA
     * @param {Cart} cartB
     * @return {boolean}
     */
    isEqual(cartA, cartB) {
        return isEqual(
            this._normalize(cartA),
            this._normalize(cartB)
        );
    }

    /**
     * @param {Cart} cart
     * @return {Cart}
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
