import { Cart } from '../cart';
import { getPhysicalItem } from '../cart/line-items.mock';

import getShippableItemsCount from './getShippableItemsCount';

describe('getShippableItemsCount', () => {
    it('return one shippable item', () => {
        const defaultPhysicalItem = getPhysicalItem();
        const physicalItemByPromotion = {
            ...defaultPhysicalItem,
            addedByPromotion: true,
        };
        const cart = {
            lineItems: {
                physicalItems: [defaultPhysicalItem, physicalItemByPromotion],
            },
        } as Cart;

        expect(getShippableItemsCount(cart)).toBe(1);
    });
});
