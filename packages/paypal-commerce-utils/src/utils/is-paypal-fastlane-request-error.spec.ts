import isPaypalFastlaneRequestError, {
    PaypalFastlaneInvalidRequestError,
} from './is-paypal-fastlane-request-error';

describe('isPaypalFastlaneRequestError', () => {
    it('should return true if paypal fastlane request is invalid', () => {
        const invalidRequestError: PaypalFastlaneInvalidRequestError = {
            name: 'Error',
            message: 'Invalid request',
            response: {
                name: 'INVALID_REQUEST',
            },
        };

        expect(isPaypalFastlaneRequestError(invalidRequestError)).toBe(true);
    });
});
