import { getShippingAddress } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import { getBraintreeAddress } from '@bigcommerce/checkout-sdk/braintree-utils';
import mapToBraintreeShippingAddressOverride from './map-to-braintree-shipping-address-override';

describe('mapToBraintreeAddress()', () => {
    it('maps shipping address to braintree address', () => {
        expect(mapToBraintreeShippingAddressOverride(getShippingAddress())).toEqual(
            getBraintreeAddress(),
        );
    });
});
