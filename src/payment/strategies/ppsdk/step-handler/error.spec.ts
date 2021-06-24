import { RequestError } from '../../../../common/error/errors';

import { handleError, isError, Error } from './error';

describe('handleError', () => {
    it('rejects with RequestError', async () => {
        const errorResponse = {
            body: {
                type: 'error',
            },
            status: 200,
            statusText: '',
            headers: [],
        };

        await expect(handleError(errorResponse)).rejects.toBeInstanceOf(RequestError);
    });
});

describe('isError', () => {
    it('returns true when passed a valid error response', () => {
        const errorResponse: Error = {
            type: 'error',
        };

        expect(isError(errorResponse)).toBe(true);
    });

    it('returns false when passed an invalid error response', () => {
        const invalidResponse = {
            type: 'anything',
        };

        expect(isError(invalidResponse)).toBe(false);
    });
});
