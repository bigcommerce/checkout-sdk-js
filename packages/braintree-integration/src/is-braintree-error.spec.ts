import isBraintreeError from './is-braintree-error';

describe('isBraintreeError', () => {
    it('error is BraintreeError', () => {
        expect(
            isBraintreeError({
                type: 'CUSTOMER',
            }),
        ).toBe(true);
    });

    it('error is not BraintreeError', () => {
        expect(isBraintreeError(null)).toBe(false);
        expect(isBraintreeError({})).toBe(false);
    });
});
