import { first, merge, without } from 'lodash';

import { getErrorResponse, getErrorResponseBody, getTimeoutResponse } from '../http-request/responses.mock';

import { RequestError, TimeoutError, UnrecoverableError } from './errors';
import { PAYMENT_ERROR_CODES } from './errors/map-from-payment-error-response';
import RequestErrorFactory from './request-error-factory';

describe('RequestErrorFactory', () => {
    it('creates error from XHR response based on type', () => {
        const factory = new RequestErrorFactory();
        const response = merge({}, getErrorResponse(), { body: { type: 'empty_cart' } });

        factory.register('empty_cart', data => new UnrecoverableError(data));

        expect(factory.createError(response)).toBeInstanceOf(UnrecoverableError);
    });

    it('creates error from XHR response based on formatted type', () => {
        const factory = new RequestErrorFactory();
        const response = merge({}, getErrorResponse(), { body: { type: 'foobar/empty_cart' } });

        factory.register('empty_cart', data => new UnrecoverableError(data));

        expect(factory.createError(response)).toBeInstanceOf(UnrecoverableError);
    });

    it('creates error from XHR response based on error code', () => {
        const factory = new RequestErrorFactory();
        const response = merge({}, getErrorResponse(), { body: { errors: [{ code: 'empty_cart' }] } });

        factory.register('empty_cart', data => new UnrecoverableError(data));

        expect(factory.createError(response)).toBeInstanceOf(UnrecoverableError);
    });

    it('creates `RequestError` from XHR response if type cannot be recognized', () => {
        const factory = new RequestErrorFactory();

        expect(factory.createError(getErrorResponse())).toBeInstanceOf(RequestError);
    });

    it('creates `TimeoutError` if XHR is aborted', () => {
        const factory = new RequestErrorFactory();
        const error = factory.createError(getTimeoutResponse());

        expect(error).toBeInstanceOf(TimeoutError);
        expect((error as TimeoutError).status).toEqual(0);
    });

    it('creates `RequestError` for alternative payment error codes and maps the message correctly', () => {
        const factory = new RequestErrorFactory();
        const errorResponse = getErrorResponseBody({
            errors: [{
                code: first(without(PAYMENT_ERROR_CODES, 'payment')),
                message: 'foo bar',
            }],
        });

        const error = factory.createError(getErrorResponse(errorResponse));

        expect(error).toBeInstanceOf(RequestError);
        expect(error.message).toBe('foo bar');
    });
});
