import assertIsGooglePayStripeTokenObject from './is-google-pay-stripe-token-object';

describe('isGooglePayStripeTokenObject', () => {
    it('should be a GooglePayStripeTokenObject', () => {
        const token = {
            id: 'tk_1234567',
        };

        expect(() => assertIsGooglePayStripeTokenObject(token)).not.toThrow();
    });

    it('should NOT be a GooglePayStripeTokenObject', () => {
        const token = {
            protocolVersion: 'foo',
            signature: 'bar',
            signedMessage: 'baz',
        };

        expect(() => assertIsGooglePayStripeTokenObject(token)).toThrow();
    });
});
