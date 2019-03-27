import isBraintreeError from './is-braintree-error';

describe('isBraintreeError()', () => {
    it('returns true if error comes from Braintree', () => {
        const error = new Error('An unknown error.');

        error.name = 'BraintreeError';

        expect(isBraintreeError(error))
            .toEqual(true);
    });

    it('returns false if error is not from Braintree', () => {
        const error = new Error('An unknown error.');

        expect(isBraintreeError(error))
            .toEqual(false);
    });
});
