import isBigcommerceFastlaneRequestError, {
    BigcommerceFastlaneRequestError,
} from './is-bigcommerce-fastlane-request-error';

describe('isBigcommerceFastlaneRequestError', () => {
    it('should return true if paypal fastlane request is invalid', () => {
        const invalidRequestError: BigcommerceFastlaneRequestError = {
            name: 'Error',
            message: 'Invalid request',
            response: {
                name: 'INVALID_REQUEST',
            },
        };

        expect(isBigcommerceFastlaneRequestError(invalidRequestError)).toBe(true);
    });
});
