import { merge } from 'lodash';
import { RequestError, UnrecoverableError } from './errors';
import { getErrorResponse } from '../http-request/responses.mock';
import RequestErrorFactory from './request-error-factory';

describe('RequestErrorFactory', () => {
    it('creates error from XHR response based on type', () => {
        const factory = new RequestErrorFactory();
        const response = merge({}, getErrorResponse(), { body: { type: 'empty_cart' } });

        factory.register('empty_cart', (data) => new UnrecoverableError(data));

        expect(factory.createError(response)).toBeInstanceOf(UnrecoverableError);
    });

    it('creates error from XHR response based on formatted type', () => {
        const factory = new RequestErrorFactory();
        const response = merge({}, getErrorResponse(), { body: { type: 'foobar/empty_cart' } });

        factory.register('empty_cart', (data) => new UnrecoverableError(data));

        expect(factory.createError(response)).toBeInstanceOf(UnrecoverableError);
    });

    it('creates error from XHR response based on error code', () => {
        const factory = new RequestErrorFactory();
        const response = merge({}, getErrorResponse(), { body: { errors: [{ code: 'empty_cart' }] } });

        factory.register('empty_cart', (data) => new UnrecoverableError(data));

        expect(factory.createError(response)).toBeInstanceOf(UnrecoverableError);
    });

    it('creates `RequestError` from XHR response if type cannot be recognized', () => {
        const factory = new RequestErrorFactory();

        expect(factory.createError(getErrorResponse())).toBeInstanceOf(RequestError);
    });
});
