import { getBillingAddress } from '../billing/billing-addresses.mock';
import { getBillingAddress as getInternalBillingAddress } from '../billing/internal-billing-addresses.mock';
import { getConsignment } from '../shipping/consignments.mock';
import { getShippingAddress as getInternalShippingAddress } from '../shipping/internal-shipping-addresses.mock';
import { getShippingAddress } from '../shipping/shipping-addresses.mock';

import mapToInternalAddress from './map-to-internal-address';

describe('mapToInternalAddress()', () => {
    it('maps to internal address', () => {
        expect(mapToInternalAddress(getBillingAddress()))
            .toEqual(getInternalBillingAddress());
    });

    it('maps to internal shipping address when consignments are passed', () => {
        expect(mapToInternalAddress(getShippingAddress(), [getConsignment()]))
            .toEqual(getInternalShippingAddress());
    });
});
