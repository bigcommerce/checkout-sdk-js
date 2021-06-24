import { RequestError } from '../../../../common/error/errors';

import { handleFailed, isFailed, Failed } from './failed';

describe('handleFailed', () => {
    it('rejects with RequestError', async () => {
        const failedResponse = {
            body: {
                type: 'failed',
                code: 'any-failure',
            },
            status: 200,
            statusText: '',
            headers: [],
        };

        await expect(handleFailed(failedResponse)).rejects.toBeInstanceOf(RequestError);
    });
});

describe('isFailed', () => {
    it('returns true when passed a valid failure response', () => {
        const failureResponse: Failed = {
            type: 'failed',
            code: 'anything',
        };

        expect(isFailed(failureResponse)).toBe(true);
    });

    it('returns false when passed an invalid failure response', () => {
        const invalidResponse = {
            type: 'anything',
        };

        expect(isFailed(invalidResponse)).toBe(false);
    });
});
