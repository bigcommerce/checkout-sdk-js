import { getCart as getInternalCart } from '../cart/internal-carts.mock';
import { getCheckoutWithGiftCertificates } from '../checkout/checkouts.mock';

import mapToInternalCart from './map-to-internal-cart';

describe('mapToInternalLineItems()', () => {
    it('maps to internal line items', () => {
        expect(mapToInternalCart(getCheckoutWithGiftCertificates()))
            .toEqual(getInternalCart());
    });
});
