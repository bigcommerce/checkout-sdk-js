import RequestError from './request-error';
import { getErrorResponse, getErrorResponseBody } from '../../http-request/responses.mock';

describe('RequestError', () => {
    it('sets error type', () => {
        const error = new RequestError(getErrorResponse());

        expect(error.type).toEqual('request');
    });

    it('sets error message with errors contained in response', () => {
        const response = getErrorResponse();
        const error = new RequestError(response);

        expect(error.message).toEqual(response.body.errors.join(' '));
    });

    it('sets error message with error objects contained in response', () => {
        const response = getErrorResponse({
            ...getErrorResponseBody(),
            errors: [
                { code: 'invalid_cvv', message: 'Invalid CVV.' },
                { code: 'invalid_account', message: 'Invalid account.' },
            ],
        });
        const error = new RequestError(response);

        expect(error.message).toEqual('Invalid CVV. Invalid account.');
    });

    it('sets error message with detail contained in response', () => {
        const response = getErrorResponse({
            ...getErrorResponseBody(),
            errors: null,
        });
        const error = new RequestError(response);

        expect(error.message).toEqual(response.body.detail);
    });

    it('sets error message with title contained in response', () => {
        const response = getErrorResponse({
            ...getErrorResponseBody(),
            detail: null,
            errors: null,
        });
        const error = new RequestError(response);

        expect(error.message).toEqual(response.body.title);
    });

    it('sets fallback error message if error message not contained in response', () => {
        const message = 'Hello world';
        const error = new RequestError(getErrorResponse({}), message);

        expect(error.message).toEqual(message);
    });

    it('sets default error message if none is provided', () => {
        const error = new RequestError({});

        expect(error.message).toBeDefined();
    });
});
