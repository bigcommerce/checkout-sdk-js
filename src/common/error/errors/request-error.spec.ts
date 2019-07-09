import { getErrorResponse } from '../../http-request/responses.mock';

import RequestError from './request-error';

describe('RequestError', () => {
    it('sets type', () => {
        const error = new RequestError(getErrorResponse());

        expect(error.type).toEqual('request');
    });

    it('sets name', () => {
        const error = new RequestError(getErrorResponse());

        expect(error.name).toEqual('RequestError');
    });

    it('sets body', () => {
        const response = getErrorResponse();
        const error = new RequestError(response);

        expect(error.body).toEqual(response.body);
    });

    it('sets status', () => {
        const response = getErrorResponse();
        const error = new RequestError(response);

        expect(error.status).toEqual(response.status);
    });

    it('sets default data when none provided', () => {
        const error = new RequestError();

        expect(error.message).toEqual('An unexpected error has occurred.');
        expect(error.status).toEqual(0);
        expect(error.body).toEqual({});
        expect(error.headers).toEqual({});
    });
});
