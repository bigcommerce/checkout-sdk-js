import { omit } from 'lodash';

import { getBillingAddress } from '../billing/billing-addresses.mock';
import { getBillingAddress as getInternalBillingAddress } from '../billing/internal-billing-addresses.mock';

import mapFromInternalAddress from './map-from-internal-address';

describe('mapFromInternalAddress()', () => {
    it('maps from internal address', () => {
        expect(mapFromInternalAddress(getInternalBillingAddress()))
            .toEqual(omit(getBillingAddress(), 'email'));
    });
});
