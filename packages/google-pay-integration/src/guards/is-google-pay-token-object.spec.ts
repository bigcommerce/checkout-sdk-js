import assertIsGooglePayTokenObject from './is-google-pay-token-object';

describe('isGooglePayTokenObject', () => {
    it('should be a GooglePayTokenObject', () => {
        const token = {
            protocolVersion: 'foo',
            signature: 'bar',
            signedMessage: 'baz',
        };

        expect(() => assertIsGooglePayTokenObject(token)).not.toThrow();
    });

    it('should NOT be a GooglePayTokenObject', () => {
        const token = {
            id: 'tk_1234567',
        };

        expect(() => assertIsGooglePayTokenObject(token)).toThrow();
    });
});
