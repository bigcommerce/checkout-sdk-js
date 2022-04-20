import { getCart } from '../cart/carts.mock';
import { getCart as getInternalCart } from '../cart/internal-carts.mock';

import mapToInternalLineItems from './map-to-internal-line-items';

describe('mapToInternalLineItems()', () => {
    it('maps to internal line items', () => {
        expect(mapToInternalLineItems(getCart().lineItems, 2))
            .toEqual(getInternalCart().items);
    });
});
