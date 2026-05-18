import InvalidBillingAddressError from './invalid-billing-address-error';

describe('InvalidBillingAddressError', () => {
    it('returns error name', () => {
        const error = new InvalidBillingAddressError('error');

        expect(error.name).toBe('InvalidBillingAddressError');
    });

    it('returns error type', () => {
        const error = new InvalidBillingAddressError('error');

        expect(error.type).toBe('invalid_billing_address');
    });
});
