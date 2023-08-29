import isGooglePayKey from './is-google-pay-key';

describe('isGooglePayKey', () => {
    describe('should be a valid key to pass initialization options:', () => {
        test('googlepayadyenv2', () => {
            expect(isGooglePayKey('googlepayadyenv2')).toBe(true);
        });

        test('googlepayadyenv3', () => {
            expect(isGooglePayKey('googlepayadyenv3')).toBe(true);
        });

        test('googlepayauthorizenet', () => {
            expect(isGooglePayKey('googlepayauthorizenet')).toBe(true);
        });

        test('googlepaybnz', () => {
            expect(isGooglePayKey('googlepaybnz')).toBe(true);
        });

        test('googlepaybraintree', () => {
            expect(isGooglePayKey('googlepaybraintree')).toBe(true);
        });

        test('googlepaycheckoutcom', () => {
            expect(isGooglePayKey('googlepaycheckoutcom')).toBe(true);
        });

        test('googlepaycybersourcev2', () => {
            expect(isGooglePayKey('googlepaycybersourcev2')).toBe(true);
        });

        test('googlepayorbital', () => {
            expect(isGooglePayKey('googlepayorbital')).toBe(true);
        });

        test('googlepaystripe', () => {
            expect(isGooglePayKey('googlepaystripe')).toBe(true);
        });

        test('googlepaystripeupe', () => {
            expect(isGooglePayKey('googlepaystripeupe')).toBe(true);
        });

        test('googlepayworldpayaccess', () => {
            expect(isGooglePayKey('googlepayworldpayaccess')).toBe(true);
        });
    });

    it('should NOT be a valid key to pass initialization options', () => {
        expect(isGooglePayKey('foo')).toBe(false);
    });
});
