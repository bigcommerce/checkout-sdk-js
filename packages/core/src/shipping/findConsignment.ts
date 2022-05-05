import { find, includes } from 'lodash';

import { Consignment } from './index';

export default function findConsignment(
    consignments: Consignment[],
    itemId: string
): Consignment | undefined {
    return find(consignments, consignment => includes(consignment.lineItemIds, itemId));
}
