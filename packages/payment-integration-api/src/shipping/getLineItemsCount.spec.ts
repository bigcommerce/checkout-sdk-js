import { getPhysicalItem } from '../cart';

import getLineItemsCount from './getLineItemsCount';

describe('getLineItemsCount()', () => {
    it('returns zero if empty array', () => {
        expect(getLineItemsCount([])).toBe(0);
    });

    it('returns the sum of quantities', () => {
        expect(getLineItemsCount([getPhysicalItem(), getPhysicalItem()])).toBe(2);
    });
});
