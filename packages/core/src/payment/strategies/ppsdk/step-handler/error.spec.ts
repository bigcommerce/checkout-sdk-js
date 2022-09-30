import { RequestError } from "@bigcommerce/checkout-sdk/payment-integration-api";

import { handleError, isError, ErrorResponse } from './error';

describe('handleError', () => {
    it('rejects with RequestError', async () => {
        const errorResponse: ErrorResponse = {
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
        const errorResponse: ErrorResponse = {
            body: {
                type: 'error',
            },
            status: 200,
            statusText: '',
            headers: [],
        };

        expect(isError(errorResponse)).toBe(true);
    });

    it('returns false when passed an invalid error response', () => {
        const invalidResponse = {
            body: {
                type: 'anything',
            },
            status: 200,
            statusText: '',
            headers: [],
        };

        expect(isError(invalidResponse)).toBe(false);
    });
});
