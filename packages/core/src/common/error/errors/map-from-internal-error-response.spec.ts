import { Response } from '@bigcommerce/request-sender';

import { InternalErrorResponseBody } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { getErrorResponse } from '../../http-request/responses.mock';

import mapFromInternalErrorResponse from './map-from-internal-error-response';
import RequestError from './request-error';

describe('mapFromInternalErrorResponse()', () => {
    let error: RequestError<InternalErrorResponseBody>;
    let response: Response<InternalErrorResponseBody>;

    beforeEach(() => {
        response = getErrorResponse({
            status: 400,
            title: 'Error with payment provider',
            type: 'invalid_payment',
            errors: ['Missing CCV.', 'Missing CC Type.'],
        });

        error = mapFromInternalErrorResponse(response);
    });

    it('keeps original body', () => {
        expect(error.body).toEqual(response.body);
    });

    it('keeps original headers', () => {
        expect(error.headers).toEqual(response.headers);
    });

    it('keeps original status', () => {
        expect(error.status).toEqual(response.status);
    });

    it('concatenates all errors, ignoring empty ones', () => {
        expect(error.message).toBe('Missing CCV. Missing CC Type.');
    });

    it('creates an array of error objects', () => {
        expect(error.errors).toEqual([
            { code: 'invalid_payment', message: 'Missing CCV.' },
            { code: 'invalid_payment', message: 'Missing CC Type.' },
        ]);
    });
});
