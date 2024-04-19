import assertIsGooglePayBraintreeTokenObject from './is-google-pay-braintree-token-object';

describe('isGooglePayBraintreeTokenObject', () => {
    it('should be a GooglePayStripeTokenObject', () => {
        const token = {
            androidPayCards: [],
        };

        expect(() => assertIsGooglePayBraintreeTokenObject(token)).not.toThrow();
    });

    it('should NOT be a isGooglePayBraintreeTokenObject', () => {
        const token = {
            protocolVersion: 'foo',
            signature: 'bar',
            signedMessage: 'baz',
        };

        expect(() => assertIsGooglePayBraintreeTokenObject(token)).toThrow();
    });
});
