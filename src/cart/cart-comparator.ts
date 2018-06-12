import { isEqual, omit } from 'lodash';

import { omitPrivate } from '../common/utility';

import Cart from './cart';
import { LineItem } from './line-item';
import LineItemMap from './line-item-map';

export default class CartComparator {
    isEqual(cartA: Cart, cartB: Cart): boolean {
        return isEqual(
            this._normalize(cartA),
            this._normalize(cartB)
        );
    }

    private _normalize(cart: Cart): Cart {
        const lineItems = Object.keys(cart.lineItems)
            .reduce((result, key) => ({
                ...result,
                [key]: (cart.lineItems[key as keyof LineItemMap] as LineItem[])
                    .map(item => omit(item, ['id', 'imageUrl'])),
            }), {} as LineItemMap);

        return omitPrivate(omit({ ...cart, lineItems }, ['updatedTime']));
    }
}
