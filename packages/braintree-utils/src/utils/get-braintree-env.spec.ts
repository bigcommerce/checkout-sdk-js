import getBraintreeEnv from './get-braintree-env';

describe('#getBraintreeEnv()', () => {
    it('get Braintree env - production', () => {
        expect(getBraintreeEnv()).toBe('production');
        expect(getBraintreeEnv(false)).toBe('production');
    });

    it('get Braintree env - sandbox', () => {
        expect(getBraintreeEnv(true)).toBe('sandbox');
    });
});
