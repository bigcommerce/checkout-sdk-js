import { handleSuccess, isSuccess, Success } from './success';

describe('handleSuccess', () => {
    it('resolves to undefined', async () => {
        await expect(handleSuccess()).resolves.toBeUndefined();
    });
});

describe('isSuccess', () => {
    it('returns true when passed a valid success response', () => {
        const successResponse: Success = {
            type: 'success',
        };

        expect(isSuccess(successResponse)).toBe(true);
    });

    it('returns false when passed an invalid success response', () => {
        const invalidResponse = {
            type: 'anything',
        };

        expect(isSuccess(invalidResponse)).toBe(false);
    });
});
