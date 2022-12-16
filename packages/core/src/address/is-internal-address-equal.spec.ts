import { getShippingAddress } from '../shipping/internal-shipping-addresses.mock';

import isInternalAddressEqual from './is-internal-address-equal';

describe('isInternalAddressEqual', () => {
    it('returns true if addresses are equal', () => {
        const output = isInternalAddressEqual(getShippingAddress(), getShippingAddress());

        expect(output).toBe(true);
    });

    it('returns false if addresses are different', () => {
        const output = isInternalAddressEqual(getShippingAddress(), {
            ...getShippingAddress(),
            addressLine1: '1 Foobar St',
        });

        expect(output).toBe(false);
    });

    it('returns true if addresses have different values for ignored fields', () => {
        expect(
            isInternalAddressEqual(getShippingAddress(), { ...getShippingAddress(), id: '123' }),
        ).toBe(true);

        expect(
            isInternalAddressEqual(getShippingAddress(), {
                ...getShippingAddress(),
                provinceCode: '123',
            }),
        ).toBe(true);
    });
});
