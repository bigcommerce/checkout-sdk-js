"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var payload_transformer_1 = require("./payload-transformer");
describe('PayloadTransformer', function () {
    var payloadTransformer;
    beforeEach(function () {
        payloadTransformer = new payload_transformer_1.default();
    });
    describe('#toRequestBody()', function () {
        it('transforms request body into JSON string if it is JSON', function () {
            var options = {
                body: { message: 'foobar' },
                headers: {
                    'Content-Type': 'application/json',
                },
            };
            expect(payloadTransformer.toRequestBody(options))
                .toEqual(JSON.stringify(options.body));
        });
        it('does not transform request body into JSON string if it is not JSON', function () {
            var options = { body: '<p>Hello world</p>' };
            expect(payloadTransformer.toRequestBody(options))
                .toEqual(options.body);
        });
    });
    describe('#toResponse()', function () {
        it('transforms input into a response object', function () {
            var xhr = {
                getAllResponseHeaders: jest.fn(function () { return "Content-Type:application/json\nContent-Language:en"; }),
                response: '{ "message": "foobar" }',
                status: 200,
                statusText: 'OK',
            };
            expect(payloadTransformer.toResponse(xhr)).toEqual({
                body: { message: 'foobar' },
                headers: {
                    'content-type': 'application/json',
                    'content-language': 'en',
                },
                status: 200,
                statusText: 'OK',
            });
        });
        it('transforms error into a response object', function () {
            var xhr = {
                getAllResponseHeaders: jest.fn(function () { return "Content-Type:application/problem+json\nContent-Language:en"; }),
                response: '{ "message": "foobar" }',
                status: 400,
                statusText: 'Bad request',
            };
            expect(payloadTransformer.toResponse(xhr)).toEqual({
                body: { message: 'foobar' },
                headers: {
                    'content-type': 'application/problem+json',
                    'content-language': 'en',
                },
                status: 400,
                statusText: 'Bad request',
            });
        });
        it('transforms failed XHR into a response object', function () {
            var xhr = {
                getAllResponseHeaders: jest.fn(function () { return undefined; }),
                response: undefined,
                status: 0,
                statusText: undefined,
            };
            expect(payloadTransformer.toResponse(xhr)).toEqual({
                body: undefined,
                headers: {},
                status: 0,
                statusText: undefined,
            });
        });
        it('falls back to parsing `responseText` if `response` is not available', function () {
            var xhr = {
                getAllResponseHeaders: jest.fn(function () { return 'Content-Type:application/json'; }),
                responseText: '{ "message": "foobar" }',
                status: 200,
                statusText: 'OK',
            };
            expect(payloadTransformer.toResponse(xhr)).toEqual(expect.objectContaining({
                body: { message: 'foobar' },
            }));
        });
        it('does not transform response body into JSON if it is not JSON', function () {
            var xhr = {
                getAllResponseHeaders: jest.fn(function () { return 'Content-Type:text/plain'; }),
                response: '{ "message": "foobar" }',
                status: 200,
                statusText: 'OK',
            };
            expect(payloadTransformer.toResponse(xhr)).toEqual(expect.objectContaining({
                body: '{ "message": "foobar" }',
            }));
        });
    });
});
//# sourceMappingURL=payload-transformer.spec.js.map