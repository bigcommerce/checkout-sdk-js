"use strict";
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var cookie = require("js-cookie");
var responses_mock_1 = require("./responses.mock");
var payload_transformer_1 = require("./payload-transformer");
var request_factory_1 = require("./request-factory");
var request_sender_1 = require("./request-sender");
describe('RequestSender', function () {
    var payloadTransformer;
    var request;
    var requestFactory;
    var requestSender;
    var url;
    beforeEach(function () {
        url = 'http://foobar/v1/endpoint';
        payloadTransformer = new payload_transformer_1.default();
        requestFactory = new request_factory_1.default();
        request = {
            abort: jest.fn(),
            send: jest.fn(),
        };
        jest.spyOn(cookie, 'get');
        jest.spyOn(requestFactory, 'createRequest').mockReturnValue(request);
        requestSender = new request_sender_1.default(requestFactory, payloadTransformer, cookie);
    });
    describe('#sendRequest()', function () {
        it('creates a HTTP request with default options', function () {
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
        it('creates a HTTP request with custom options', function () {
            var options = {
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
        it('creates a HTTP request with default options unless they are overridden', function () {
            var options = {
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
        it('creates a HTTP request with CSRF token if it exists', function () {
            cookie.get.mockImplementation(function (key) { return key === 'XSRF-TOKEN' ? 'abc' : undefined; });
            requestSender.sendRequest(url);
            expect(requestFactory.createRequest).toHaveBeenCalledWith(url, expect.objectContaining({
                headers: expect.objectContaining({
                    'X-XSRF-TOKEN': 'abc',
                }),
            }));
        });
        it('sends the request with data', function () {
            var options = {
                body: { message: 'foobar' },
                method: 'POST',
            };
            var requestBody = '{"message":"foobar"}';
            jest.spyOn(payloadTransformer, 'toRequestBody').mockReturnValue(requestBody);
            requestSender.sendRequest(url, options);
            expect(payloadTransformer.toRequestBody).toHaveBeenCalledWith(expect.objectContaining(options));
            expect(request.send).toHaveBeenCalledWith(requestBody);
        });
        it('resolves with the response of the request', function () {
            var response = responses_mock_1.getResponse({ message: 'foobar' });
            jest.spyOn(payloadTransformer, 'toResponse').mockReturnValue(response);
            var promise = requestSender.sendRequest(url);
            request.onload();
            expect(promise).resolves.toEqual(response);
            expect(payloadTransformer.toResponse).toHaveBeenCalledWith(request);
        });
        it('rejects with the response of the request if the server returns an error', function () {
            var response = responses_mock_1.getErrorResponse({ message: 'foobar' });
            jest.spyOn(payloadTransformer, 'toResponse').mockReturnValue(response);
            var promise = requestSender.sendRequest(url, {
                body: { message: 'foobar' },
                method: 'POST',
            });
            request.onload();
            expect(promise).rejects.toEqual(response);
            expect(payloadTransformer.toResponse).toHaveBeenCalledWith(request);
        });
        it('rejects with the response of the request if it fails', function () {
            var response = responses_mock_1.getTimeoutResponse();
            jest.spyOn(payloadTransformer, 'toResponse').mockReturnValue(response);
            var promise = requestSender.sendRequest(url, {
                body: { message: 'foobar' },
                method: 'POST',
            });
            request.onerror();
            expect(promise).rejects.toEqual(response);
            expect(payloadTransformer.toResponse).toHaveBeenCalledWith(request);
        });
        it('aborts the request when resolving the `timeout` promise', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var response, timeout, promise;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        response = responses_mock_1.getTimeoutResponse();
                        jest.spyOn(payloadTransformer, 'toResponse').mockReturnValue(response);
                        timeout = new Promise(function (resolve) { return resolve(); });
                        promise = requestSender.sendRequest(url, { timeout: timeout });
                        return [4 /*yield*/, timeout];
                    case 1:
                        _a.sent();
                        request.onabort();
                        expect(promise).rejects.toEqual(response);
                        expect(request.abort).toHaveBeenCalled();
                        expect(payloadTransformer.toResponse).toHaveBeenCalledWith(request);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('#get()', function () {
        it('sends a GET request', function () {
            jest.spyOn(requestSender, 'sendRequest');
            requestSender.get(url);
            expect(requestSender.sendRequest).toHaveBeenCalledWith(url, { method: 'GET' });
        });
    });
    describe('#post()', function () {
        it('sends a POST request', function () {
            jest.spyOn(requestSender, 'sendRequest');
            requestSender.post(url);
            expect(requestSender.sendRequest).toHaveBeenCalledWith(url, { method: 'POST' });
        });
    });
    describe('#put()', function () {
        it('sends a PUT request', function () {
            jest.spyOn(requestSender, 'sendRequest');
            requestSender.put(url);
            expect(requestSender.sendRequest).toHaveBeenCalledWith(url, { method: 'PUT' });
        });
    });
    describe('#patch()', function () {
        it('sends a PATCH request', function () {
            jest.spyOn(requestSender, 'sendRequest');
            requestSender.patch(url);
            expect(requestSender.sendRequest).toHaveBeenCalledWith(url, { method: 'PATCH' });
        });
    });
    describe('#delete()', function () {
        it('sends a DELETE request', function () {
            jest.spyOn(requestSender, 'sendRequest');
            requestSender.delete(url);
            expect(requestSender.sendRequest).toHaveBeenCalledWith(url, { method: 'DELETE' });
        });
    });
});
//# sourceMappingURL=request-sender.spec.js.map