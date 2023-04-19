import isGooglePayErrorObject from './is-google-pay-error-object';

describe('isGooglePayErrorObject', () => {
    it('should be Google Pay error object', () => {
        expect(
            isGooglePayErrorObject({
                statusCode: 'foo',
            }),
        ).toBe(true);
    });

    describe('should NOT be Google Pay error object if:', () => {
        test('string', () => {
            expect(isGooglePayErrorObject('error')).toBe(false);
        });

        test('null', () => {
            expect(isGooglePayErrorObject(null)).toBe(false);
        });

        test('empty', () => {
            expect(isGooglePayErrorObject({})).toBe(false);
        });
    });
});
