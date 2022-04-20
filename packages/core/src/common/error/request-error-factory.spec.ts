import { merge } from 'lodash';

import { PaymentMethodInvalidError } from '../../payment/errors';
import { getErrorResponse, getErrorResponseBody, getTimeoutResponse } from '../http-request/responses.mock';

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

    it('exposes first error code if it has an array of errors', () => {
        const factory = new RequestErrorFactory();
        const errorResponse = getErrorResponseBody({
            errors: [{
                code: 'foo',
                message: 'bar',
            }],
        });

        const error = factory.createError(getErrorResponse(errorResponse));

        expect(error).toBeInstanceOf(RequestError);
        expect(error.message).toBe('bar');
    });

    it('overrides with registered error when error code matches registered key', () => {
        const factory = new RequestErrorFactory();

        factory.register('payment_config_not_found', data => new PaymentMethodInvalidError(data));

        const errorResponse = getErrorResponseBody({
            errors: [{
                code: 'payment_config_not_found',
                message: 'bar',
            }],
        });

        const error = factory.createError(getErrorResponse(errorResponse));

        expect(error.type).toBe('payment_method_invalid');
        expect(error.message).toBe('There is a problem processing your payment. Please try again later.');
    });
});
