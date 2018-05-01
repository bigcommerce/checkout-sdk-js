import { getShippingAddress as getInternalShippingAddress } from '../shipping/internal-shipping-addresses.mock';
import { getShippingAddress } from '../shipping/shipping-addresses.mock';

import mapFromInternalAddress from './map-from-internal-address';

describe('mapFromInternalAddress()', () => {
    it('maps from internal address', () => {
        expect(mapFromInternalAddress(getInternalShippingAddress()))
            .toEqual(getShippingAddress());
    });
});
