import { merge } from 'lodash';

import { getErrorResponse, getTimeoutResponse } from '../http-request/responses.mock';

import { RequestError, TimeoutError, UnrecoverableError } from './errors';
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
});
