import { RequestError } from '../../../../common/error/errors';

import { handleNetworkError, isNetworkError } from './network-error';

describe('handleNetworkError', () => {
    it('rejects with RequestError', async () => {
        const response = {
            body: undefined,
            status: 500,
            statusText: '',
            headers: [],
        };

        await expect(handleNetworkError(response)).rejects.toBeInstanceOf(RequestError);
    });
});

describe('isNetworkError', () => {
    it('returns true when passed error range status values', () => {
        expect(isNetworkError(400)).toBe(true);
        expect(isNetworkError(500)).toBe(true);
    });

    it('returns false when passed success range status values', () => {
        expect(isNetworkError(200)).toBe(false);
        expect(isNetworkError(300)).toBe(false);
    });
});
