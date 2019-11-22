
import { getShippingAddress } from '../../../shipping/shipping-addresses.mock';

import { getBraintreeAddress } from './braintree.mock';
import mapToBraintreeShippingAddressOverride from './map-to-braintree-shipping-address-override';

describe('mapToBraintreeAddress()', () => {
    it('maps shipping address to braintree address', () => {
        expect(mapToBraintreeShippingAddressOverride(getShippingAddress()))
            .toEqual(getBraintreeAddress());
    });
});
