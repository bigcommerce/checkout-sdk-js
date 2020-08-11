import { getPhysicalItem } from '../cart/line-items.mock';

import getLineItemsCount from './getLineItemsCount';

describe('getLineItemsCount()', () => {
    it('returns zero if empty array', () => {
        expect(getLineItemsCount([]))
            .toEqual(0);
    });

    it('returns the sum of quantities', () => {
        expect(getLineItemsCount([
            getPhysicalItem(),
            getPhysicalItem(),
        ]))
            .toEqual(2);
    });
});
