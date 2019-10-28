
import { getShippingAddress } from '../../../shipping/shipping-addresses.mock';

import { getBraintreeAddress } from './braintree.mock';
import mapToBraintreeAddress from './map-to-braintree-address';

describe('mapToBraintreeAddress()', () => {
    it('maps shipping address to braintree address', () => {
        expect(mapToBraintreeAddress(getShippingAddress()))
            .toEqual(getBraintreeAddress());
    });
});
