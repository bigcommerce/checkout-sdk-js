import PayloadTransformer from './payload-transformer';

describe('PayloadTransformer', () => {
    let payloadTransformer;

    beforeEach(() => {
        payloadTransformer = new PayloadTransformer();
    });

    describe('#toRequestBody()', () => {
        it('transforms request body into JSON string if it is JSON', () => {
            const options = {
                body: { message: 'foobar' },
                headers: {
                    'Content-Type': 'application/json',
                },
            };

            expect(payloadTransformer.toRequestBody(options))
                .toEqual(JSON.stringify(options.body));
        });

        it('does not transform request body into JSON string if it is not JSON', () => {
            const options = { body: '<p>Hello world</p>' };

            expect(payloadTransformer.toRequestBody(options))
                .toEqual(options.body);
        });
    });

    describe('#toResponse()', () => {
        it('transforms input into a response object', () => {
            const xhr = {
                getAllResponseHeaders: jest.fn(
                    () => `Content-Type:application/json\nContent-Language:en`
                ),
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

        it('transforms error into a response object', () => {
            const xhr = {
                getAllResponseHeaders: jest.fn(
                    () => `Content-Type:application/problem+json\nContent-Language:en`
                ),
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

        it('transforms failed XHR into a response object', () => {
            const xhr = {
                getAllResponseHeaders: jest.fn(
                    () => undefined
                ),
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

        it('falls back to parsing `responseText` if `response` is not available', () => {
            const xhr = {
                getAllResponseHeaders: jest.fn(
                    () => 'Content-Type:application/json'
                ),
                responseText: '{ "message": "foobar" }',
                status: 200,
                statusText: 'OK',
            };

            expect(payloadTransformer.toResponse(xhr)).toEqual(expect.objectContaining({
                body: { message: 'foobar' },
            }));
        });

        it('does not transform response body into JSON if it is not JSON', () => {
            const xhr = {
                getAllResponseHeaders: jest.fn(
                    () => 'Content-Type:text/plain'
                ),
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
