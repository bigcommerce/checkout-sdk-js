import isBraintreeConnectName from './is-braintree-connect-name';

describe('isBraintreeConnectName', () => {
    it('returns false if name is undefined', () => {
        const name = undefined;

        expect(isBraintreeConnectName(name)).toBe(false);
    });

    it('returns true if name belongs to connect', () => {
        const name = {
            given_name: 'Test',
            surname: 'Test',
        };

        expect(isBraintreeConnectName(name)).toBe(true);
    });
});
