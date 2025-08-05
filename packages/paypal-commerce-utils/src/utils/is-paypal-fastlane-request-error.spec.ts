import isPaypalFastlaneRequestError from './is-paypal-fastlane-request-error';

interface PaypalFastlaneRequestError {
    message: string;
    response: {
        body: {
            name: string;
        };
    };
}

describe('isPaypalFastlaneRequestError', () => {
    it('returns true for a valid PaypalFastlaneRequestError object', () => {
        const error: PaypalFastlaneRequestError = {
            message: 'Some error occurred',
            response: {
                body: {
                    name: 'SomeErrorName',
                },
            },
        };

        expect(isPaypalFastlaneRequestError(error)).toBe(true);
    });

    it('returns false when error is null', () => {
        expect(isPaypalFastlaneRequestError(null)).toBe(false);
    });

    it('returns false when error is a string', () => {
        expect(isPaypalFastlaneRequestError('error')).toBe(false);
    });

    it('returns false when error is an object missing response', () => {
        const error = {
            message: 'Missing response',
        };
        expect(isPaypalFastlaneRequestError(error)).toBe(false);
    });

    it('returns false when response has no body', () => {
        const error = {
            message: 'No body',
            response: {},
        };
        expect(isPaypalFastlaneRequestError(error)).toBe(false);
    });

    it('returns false when body has no name property', () => {
        const error = {
            message: 'No name in body',
            response: {
                body: {},
            },
        };
        expect(isPaypalFastlaneRequestError(error)).toBe(false);
    });

    it('returns false when message property is missing', () => {
        const error = {
            response: {
                body: {
                    name: 'MissingMessage',
                },
            },
        };
        expect(isPaypalFastlaneRequestError(error)).toBe(false);
    });
});
