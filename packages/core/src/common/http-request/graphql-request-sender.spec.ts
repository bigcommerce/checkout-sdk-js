import { createRequestSender, createTimeout, RequestSender } from '@bigcommerce/request-sender';

import GraphQLRequestError from './graphql-request-error';
import GraphQLRequestSender, { GraphQLDocument } from './graphql-request-sender';
import { getResponse } from './responses.mock';
import { SDK_VERSION_HEADERS } from './sdk-version-headers';

describe('GraphQLRequestSender', () => {
    let requestSender: RequestSender;
    let graphQLRequestSender: GraphQLRequestSender;

    interface TestData {
        foo: string;
    }

    interface TestVariables {
        bar?: string | null;
    }

    const document: GraphQLDocument<TestData, TestVariables> =
        'query Test($bar: String) { foo(bar: $bar) }';

    beforeEach(() => {
        requestSender = createRequestSender();
        graphQLRequestSender = new GraphQLRequestSender(requestSender);
    });

    describe('#query()', () => {
        it('posts the document and variables with authorization headers', async () => {
            jest.spyOn(requestSender, 'post').mockResolvedValue(
                getResponse({ data: { foo: 'bar' } }),
            );

            const data = await graphQLRequestSender.query(
                document,
                { bar: 'baz' },
                { token: 'b2b-token' },
            );

            expect(requestSender.post).toHaveBeenCalledWith('/graphql', {
                timeout: undefined,
                headers: {
                    Authorization: 'Bearer b2b-token',
                    'Content-Type': 'application/json',
                    ...SDK_VERSION_HEADERS,
                },
                body: {
                    query: 'query Test($bar: String) { foo(bar: $bar) }',
                    variables: { bar: 'baz' },
                },
            });
            expect(data).toEqual({ foo: 'bar' });
        });

        it('honours a custom endpoint and timeout', async () => {
            jest.spyOn(requestSender, 'post').mockResolvedValue(
                getResponse({ data: { foo: 'bar' } }),
            );

            const timeout = createTimeout();

            await graphQLRequestSender.query(
                document,
                { bar: null },
                { token: 'b2b-token', endpoint: '/custom/graphql', timeout },
            );

            expect(requestSender.post).toHaveBeenCalledWith(
                '/custom/graphql',
                expect.objectContaining({ timeout }),
            );
        });

        it('throws GraphQLRequestError when the response contains errors', async () => {
            jest.spyOn(requestSender, 'post').mockResolvedValue(
                getResponse({ data: null, errors: [{ message: 'Not authorized' }] }),
            );

            const promise = graphQLRequestSender.query(
                document,
                { bar: 'baz' },
                { token: 'b2b-token' },
            );

            await expect(promise).rejects.toThrow(GraphQLRequestError);
            await expect(promise).rejects.toThrow('Not authorized');
        });

        it('throws GraphQLRequestError when the response is missing data', async () => {
            jest.spyOn(requestSender, 'post').mockResolvedValue(getResponse({}));

            await expect(
                graphQLRequestSender.query(document, { bar: 'baz' }, { token: 'b2b-token' }),
            ).rejects.toThrow(GraphQLRequestError);
        });

        it('throws GraphQLRequestError when the request fails with an error response', async () => {
            jest.spyOn(requestSender, 'post').mockRejectedValue(
                getResponse(
                    { errors: [{ message: 'Provided token is invalid' }] },
                    {},
                    401,
                    'Unauthorized',
                ),
            );

            const promise = graphQLRequestSender.query(
                document,
                { bar: 'baz' },
                { token: 'b2b-token' },
            );

            await expect(promise).rejects.toThrow(GraphQLRequestError);
            await expect(promise).rejects.toThrow('Provided token is invalid');
        });

        it('throws GraphQLRequestError when the request fails without a usable body', async () => {
            jest.spyOn(requestSender, 'post').mockRejectedValue(
                getResponse('Internal Server Error', {}, 500, 'Internal Server Error'),
            );

            const promise = graphQLRequestSender.query(
                document,
                { bar: 'baz' },
                { token: 'b2b-token' },
            );

            await expect(promise).rejects.toThrow(GraphQLRequestError);
            await expect(promise).rejects.toThrow(
                'An unexpected error has occurred while executing a GraphQL request.',
            );
        });

        it('rethrows errors that are not responses', async () => {
            const error = new Error('Network failure');

            jest.spyOn(requestSender, 'post').mockRejectedValue(error);

            await expect(
                graphQLRequestSender.query(document, { bar: 'baz' }, { token: 'b2b-token' }),
            ).rejects.toBe(error);
        });
    });
});
