import isBraintreeConnectPhone from './is-braintree-connect-phone';

describe('isBraintreeConnectPhone()', () => {
    it('returns true if phone number belongs to connect', () => {
        const braintreeConnectPhone = {
            country_code: '12',
            national_number: '122345',
        };

        expect(isBraintreeConnectPhone(braintreeConnectPhone)).toBe(true);
    });

    it('return false if phone doesnt belong to connect', () => {
        const braintreeConnectPhone = '123456790';

        expect(isBraintreeConnectPhone(braintreeConnectPhone)).toBe(false);
    });

    it('return false if phone is undefined', () => {
        const braintreeConnectPhone = undefined;

        expect(isBraintreeConnectPhone(braintreeConnectPhone)).toBe(false);
    });
});
