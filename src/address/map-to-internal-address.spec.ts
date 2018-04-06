import { getShippingAddress as getInternalShippingAddress } from '../shipping/internal-shipping-addresses.mock';
import { getShippingAddress } from '../shipping/shipping-addresses.mock';

import mapToInternalAddress from './map-to-internal-address';

describe('mapToInternalAddress()', () => {
    it('maps to internal address', () => {
        expect(mapToInternalAddress(getShippingAddress()))
            .toEqual(getInternalShippingAddress());
    });
});
