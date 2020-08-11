import { reduce } from 'lodash';

import { Cart, PhysicalItem } from '../cart';

import findConsignment from './findConsignment';
import { Consignment } from './index';
import ShippableItem from './ShippableItem';

export default function getShippableLineItems(
    cart: Cart,
    consignments: Consignment[]
): ShippableItem[] {
    return reduce(
        (cart && cart.lineItems.physicalItems) || [],
        (result, item, i) => (
            !item.addedByPromotion ?
                result.concat(...splitItem(item, consignments, i)) :
                result
        ),
        [] as ShippableItem[]
    );
}

function splitItem(
    item: PhysicalItem,
    consignments: Consignment[],
    lineItemIndex: number
): ShippableItem[] {
    let splitItems: ShippableItem[] = [];
    const consignment = findConsignment(consignments, item.id as string);

    for (let i = 0; i < item.quantity; i++) {
        splitItems = splitItems.concat({
            ...item,
            key: `${item.variantId}-${item.productId}-${lineItemIndex}-${i}`,
            consignment,
            quantity: 1,
        });
    }

    return splitItems;
}
