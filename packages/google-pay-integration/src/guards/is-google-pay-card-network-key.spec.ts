import isGooglePayCardNetworkKey from './is-google-pay-card-network-key';

describe('isGooglePayCardNetwork', () => {
    test('AMEX is a key of GooglePayCardNetwork', () => {
        expect(isGooglePayCardNetworkKey('AMEX')).toBe(true);
    });

    test('DISCOVER is a key of GooglePayCardNetwork', () => {
        expect(isGooglePayCardNetworkKey('DISCOVER')).toBe(true);
    });

    test('INTERAC is a key of GooglePayCardNetwork', () => {
        expect(isGooglePayCardNetworkKey('INTERAC')).toBe(true);
    });

    test('JCB is a key of GooglePayCardNetwork', () => {
        expect(isGooglePayCardNetworkKey('JCB')).toBe(true);
    });

    test('MC is a key of GooglePayCardNetwork', () => {
        expect(isGooglePayCardNetworkKey('MC')).toBe(true);
    });

    test('VISA is a key of GooglePayCardNetwork', () => {
        expect(isGooglePayCardNetworkKey('VISA')).toBe(true);
    });

    test('FOO is NOT a key of GooglePayCardNetwork', () => {
        expect(isGooglePayCardNetworkKey('FOO')).toBe(false);
    });
});
