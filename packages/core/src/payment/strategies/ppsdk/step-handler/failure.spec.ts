import { RequestError } from '../../../../common/error/errors';

import { FailureResponse, handleFailure, isFailure } from './failure';

describe('handleFailure', () => {
    it('rejects with RequestError', async () => {
        const failureResponse: FailureResponse = {
            body: {
                type: 'failure',
                code: 'any-failure',
            },
            status: 200,
            statusText: '',
            headers: [],
        };

        await expect(handleFailure(failureResponse)).rejects.toBeInstanceOf(RequestError);
        await expect(handleFailure(failureResponse)).rejects.toStrictEqual(
            expect.objectContaining({
                body: { errors: [{ code: 'any-failure' }] },
            }),
        );
    });
});

describe('isFailure', () => {
    it('returns true when passed a valid failure response', () => {
        const failureResponse: FailureResponse = {
            body: {
                type: 'failure',
                code: 'any-failure',
            },
            status: 200,
            statusText: '',
            headers: [],
        };

        expect(isFailure(failureResponse)).toBe(true);
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

        expect(isFailure(invalidResponse)).toBe(false);
    });
});
