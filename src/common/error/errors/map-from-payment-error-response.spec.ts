import { Response } from '@bigcommerce/request-sender';

import { getErrorResponse } from '../../http-request/responses.mock';
import { PaymentErrorResponseBody } from '../error-response-body';

import mapFromPaymentErrorResponse from './map-from-payment-error-response';
import RequestError from './request-error';

describe('mapFromPaymentErrorResponse()', () => {
    let error: RequestError<PaymentErrorResponseBody>;
    let response: Response<PaymentErrorResponseBody>;

    beforeEach(() => {
        response = getErrorResponse({
            status: '',
            errors: [
                { code: 'invalid_cvv', message: undefined },
                { code: 'invalid_number', message: 'Invalid number' },
                { code: 'invalid_empty', message: '' },
                { code: 'invalid_account', message: 'Invalid account.' },
            ],
        });

        error = mapFromPaymentErrorResponse(response);
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

    it('creates an array of error objects', () => {
        expect(error.errors).toEqual(response.body.errors);
    });

    it('concatenates all errors, ignoring empty ones', () => {
        expect(error.message).toEqual('Invalid number Invalid account.');
    });
});
