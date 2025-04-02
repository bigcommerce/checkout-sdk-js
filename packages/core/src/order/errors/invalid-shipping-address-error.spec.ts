import InvalidShippingAddressError from './invalid-shipping-address-error';

describe('InvalidShippingAddressError', () => {
    it('returns error name', () => {
        const error = new InvalidShippingAddressError('error');

        expect(error.name).toBe('InvalidShippingAddressError');
    });
});
