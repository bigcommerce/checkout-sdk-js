import { getShippingAddress } from '../shipping/shipping-addresses.mock';

import isAddressEqual from './is-address-equal';

describe('isInternalAddressEqual', () => {
    it('returns true if addresses are equal', () => {
        const output = isAddressEqual(getShippingAddress(), getShippingAddress());

        expect(output).toBe(true);
    });

    it('returns false if addresses are different', () => {
        const output = isAddressEqual(getShippingAddress(), {
            ...getShippingAddress(),
            address1: '1 Foobar St',
        });

        expect(output).toBe(false);
    });

    it('returns true if addresses have different values for ignored fields', () => {
        expect(
            isAddressEqual(getShippingAddress(), { ...getShippingAddress(), country: 'x' }),
        ).toBe(true);

        expect(
            isAddressEqual(getShippingAddress(), {
                ...getShippingAddress(),
                stateOrProvinceCode: '123',
            }),
        ).toBe(true);
    });
});
