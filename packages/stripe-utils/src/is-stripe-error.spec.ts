import { isStripeError } from './is-stripe-error';

describe('isStripeError', () => {
    it('should return false if the error is undefined', () => {
        expect(isStripeError(undefined)).toBe(false);
    });

    it('should return false if the error is null', () => {
        expect(isStripeError(null)).toBe(false);
    });

    it('should return false if the error does not contain type', () => {
        expect(isStripeError({})).toBe(false);
    });

    it('should return true if the error is a StripeError', () => {
        const error = { type: 'some type' };

        expect(isStripeError(error)).toBe(true);
    });
});
