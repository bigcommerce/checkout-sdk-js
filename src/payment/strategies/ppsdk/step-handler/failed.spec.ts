import { RequestError } from '../../../../common/error/errors';

import { handleFailed, isFailed, FailedResponse } from './failed';

describe('handleFailed', () => {
    it('rejects with RequestError', async () => {
        const failedResponse: FailedResponse = {
            body: {
                type: 'failed',
                code: 'any-failure',
            },
            status: 200,
            statusText: '',
            headers: [],
        };

        await expect(handleFailed(failedResponse)).rejects.toBeInstanceOf(RequestError);
        await expect(handleFailed(failedResponse)).rejects.toStrictEqual(
            expect.objectContaining({
                body: { errors: [{ code: 'any-failure' }] },
            })
        );
    });
});

describe('isFailed', () => {
    it('returns true when passed a valid failure response', () => {
        const failedResponse: FailedResponse = {
            body: {
                type: 'failed',
                code: 'any-failure',
            },
            status: 200,
            statusText: '',
            headers: [],
        };

        expect(isFailed(failedResponse)).toBe(true);
    });

    it('returns false when passed an invalid failure response', () => {
        const invalidResponse = {
            body: {
                type: 'anything',
            },
            status: 200,
            statusText: '',
            headers: [],
        };

        expect(isFailed(invalidResponse)).toBe(false);
    });
});
