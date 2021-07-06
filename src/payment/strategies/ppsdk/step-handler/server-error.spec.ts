import { RequestError } from '../../../../common/error/errors';

import { handleServerError, isServerError } from './server-error';

describe('handleServerError', () => {
    it('rejects with RequestError', async () => {
        const response = {
            body: undefined,
            status: 500,
            statusText: '',
            headers: [],
        };

        await expect(handleServerError(response)).rejects.toBeInstanceOf(RequestError);
    });
});

describe('isServerError', () => {
    it('returns true when passed error range status values', () => {
        expect(isServerError(0)).toBe(true);
        expect(isServerError(400)).toBe(true);
        expect(isServerError(500)).toBe(true);
    });

    it('returns false when passed success range status values', () => {
        expect(isServerError(200)).toBe(false);
        expect(isServerError(300)).toBe(false);
    });
});
