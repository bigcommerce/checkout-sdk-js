import { PhysicalItem } from '../cart';
import { getPhysicalItem as getCartPhysicalItem } from '../cart/line-items.mock';

export function getPhysicalItem(): PhysicalItem {
    return {
        ...getCartPhysicalItem(),
        id: 5,
    };
}
