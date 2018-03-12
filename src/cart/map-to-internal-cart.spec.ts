import { getCheckout } from '../checkout/checkouts.mock';
import { getCart as getInternalCart } from '../cart/internal-carts.mock';
import mapToInternalCart from './map-to-internal-cart';

describe('mapToInternalLineItems()', () => {
    it('maps to internal line items', () => {
        expect(mapToInternalCart(getCheckout(), getInternalCart()))
            .toEqual(getInternalCart());
    });
});
