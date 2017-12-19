import * as cookie from 'js-cookie';
import { getErrorResponse, getResponse, getTimeoutResponse } from './responses.mock';
import PayloadTransformer from './payload-transformer';
import RequestFactory from './request-factory';
import RequestSender from './request-sender';

describe('RequestSender', () => {
    let payloadTransformer;
    let request;
    let requestFactory;
    let requestSender;
    let url;

    beforeEach(() => {
        url = 'http://foobar/v1/endpoint';
        payloadTransformer = new PayloadTransformer();
        requestFactory = new RequestFactory();
        request = {
            abort: jest.fn(),
            send: jest.fn(),
        };

        jest.spyOn(cookie, 'get');
        jest.spyOn(requestFactory, 'createRequest').mockReturnValue(request);

        requestSender = new RequestSender(requestFactory, payloadTransformer, cookie);
    });

    describe('#sendRequest()', () => {
        it('creates a HTTP request with default options', () => {
            requestSender.sendRequest(url);

            expect(requestFactory.createRequest).toHaveBeenCalledWith(url, {
                credentials: true,
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                },
                method: 'GET',
            });
        });

        it('creates a HTTP request with custom options', () => {
            const options = {
                body: 'foobar',
                credentials: false,
                headers: {
                    'Accept': 'text/plain',
                    'Content-Type': 'text/plain',
                },
                method: 'POST',
            };

            requestSender.sendRequest(url, options);

            expect(requestFactory.createRequest).toHaveBeenCalledWith(url, options);
        });

        it('creates a HTTP request with default options unless they are overridden', () => {
            const options = {
                headers: {
                    Accept: 'text/plain',
                    Authorization: 'Basic YWxhZGRpbjpvcGVuc2VzYW1l',
                },
                method: 'POST',
            };

            requestSender.sendRequest(url, options);

            expect(requestFactory.createRequest).toHaveBeenCalledWith(url, {
                credentials: true,
                headers: {
                    'Accept': 'text/plain',
                    'Authorization': 'Basic YWxhZGRpbjpvcGVuc2VzYW1l',
                    'Content-Type': 'application/json',
                },
                method: 'POST',
            });
        });

        it('creates a HTTP request with CSRF token if it exists', () => {
            cookie.get.mockImplementation(key => key === 'XSRF-TOKEN' ? 'abc' : undefined);

            requestSender.sendRequest(url);

            expect(requestFactory.createRequest).toHaveBeenCalledWith(url, expect.objectContaining({
                headers: expect.objectContaining({
                    'X-XSRF-TOKEN': 'abc',
                }),
            }));
        });

        it('sends the request with data', () => {
            const options = {
                body: { message: 'foobar' },
                method: 'POST',
            };
            const requestBody = '{"message":"foobar"}';

            jest.spyOn(payloadTransformer, 'toRequestBody').mockReturnValue(requestBody);

            requestSender.sendRequest(url, options);

            expect(payloadTransformer.toRequestBody).toHaveBeenCalledWith(expect.objectContaining(options));
            expect(request.send).toHaveBeenCalledWith(requestBody);
        });

        it('resolves with the response of the request', () => {
            const response = getResponse({ message: 'foobar' });

            jest.spyOn(payloadTransformer, 'toResponse').mockReturnValue(response);

            const promise = requestSender.sendRequest(url);

            request.onload();

            expect(promise).resolves.toEqual(response);
            expect(payloadTransformer.toResponse).toHaveBeenCalledWith(request);
        });

        it('rejects with the response of the request if the server returns an error', () => {
            const response = getErrorResponse({ message: 'foobar' });

            jest.spyOn(payloadTransformer, 'toResponse').mockReturnValue(response);

            const promise = requestSender.sendRequest(url, {
                body: { message: 'foobar' },
                method: 'POST',
            });

            request.onload();

            expect(promise).rejects.toEqual(response);
            expect(payloadTransformer.toResponse).toHaveBeenCalledWith(request);
        });

        it('rejects with the response of the request if it fails', () => {
            const response = getTimeoutResponse();

            jest.spyOn(payloadTransformer, 'toResponse').mockReturnValue(response);

            const promise = requestSender.sendRequest(url, {
                body: { message: 'foobar' },
                method: 'POST',
            });

            request.onerror();

            expect(promise).rejects.toEqual(response);
            expect(payloadTransformer.toResponse).toHaveBeenCalledWith(request);
        });

        it('aborts the request when resolving the `timeout` promise', async () => {
            const response = getTimeoutResponse();

            jest.spyOn(payloadTransformer, 'toResponse').mockReturnValue(response);

            const timeout = new Promise(resolve => resolve());
            const promise = requestSender.sendRequest(url, { timeout });

            await timeout;

            request.onabort();

            expect(promise).rejects.toEqual(response);
            expect(request.abort).toHaveBeenCalled();
            expect(payloadTransformer.toResponse).toHaveBeenCalledWith(request);
        });
    });

    describe('#get()', () => {
        it('sends a GET request', () => {
            jest.spyOn(requestSender, 'sendRequest');

            requestSender.get(url);

            expect(requestSender.sendRequest).toHaveBeenCalledWith(url, { method: 'GET' });
        });
    });

    describe('#post()', () => {
        it('sends a POST request', () => {
            jest.spyOn(requestSender, 'sendRequest');

            requestSender.post(url);

            expect(requestSender.sendRequest).toHaveBeenCalledWith(url, { method: 'POST' });
        });
    });

    describe('#put()', () => {
        it('sends a PUT request', () => {
            jest.spyOn(requestSender, 'sendRequest');

            requestSender.put(url);

            expect(requestSender.sendRequest).toHaveBeenCalledWith(url, { method: 'PUT' });
        });
    });

    describe('#patch()', () => {
        it('sends a PATCH request', () => {
            jest.spyOn(requestSender, 'sendRequest');

            requestSender.patch(url);

            expect(requestSender.sendRequest).toHaveBeenCalledWith(url, { method: 'PATCH' });
        });
    });

    describe('#delete()', () => {
        it('sends a DELETE request', () => {
            jest.spyOn(requestSender, 'sendRequest');

            requestSender.delete(url);

            expect(requestSender.sendRequest).toHaveBeenCalledWith(url, { method: 'DELETE' });
        });
    });
});
