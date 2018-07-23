
import { getShippingAddress } from '../shipping/shipping-addresses.mock';

import { getBillingAddress } from './billing-addresses.mock';
import isBillingAddressLike from './is-billing-address-like';

describe('isBillingAddressLike', () => {
    it('returns true if billing address', () => {
        expect(isBillingAddressLike(getBillingAddress()))
            .toBeTruthy();
    });

    it('returns false if shipping address', () => {
        expect(isBillingAddressLike(getShippingAddress()))
            .toBeFalsy();
    });
});
