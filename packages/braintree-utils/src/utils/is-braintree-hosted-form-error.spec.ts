import { isBraintreeHostedFormError } from '../index';

describe('isBraintreeHostedFormError', () => {
    it('should return true error belongs to hosted form', () => {
        const error = {
            code: 'INVALID_DETAILS',
            message: 'The "details.invalidFieldKeys" field is present but invalid.',
            details: {
                reason: 'Expected "invalidFieldKeys" to be undefined or a valid value, but got an invalid value instead.',
            },
        };

        expect(isBraintreeHostedFormError(error)).toBe(true);
    });
});
