import GraphQLRequestError from './graphql-request-error';
import { getResponse } from './responses.mock';

describe('GraphQLRequestError', () => {
    it('uses the message of the first GraphQL error', () => {
        const error = new GraphQLRequestError(getResponse({}), [
            { message: 'Not authorized' },
            { message: 'Something else' },
        ]);

        expect(error.message).toBe('Not authorized');
    });

    it('falls back to a default message when there are no errors', () => {
        const error = new GraphQLRequestError(getResponse({}));

        expect(error.message).toBe(
            'An unexpected error has occurred while executing a GraphQL request.',
        );
        expect(error.errors).toEqual([]);
    });

    it('exposes the response status and error list', () => {
        const errors = [{ message: 'Not authorized' }];
        const error = new GraphQLRequestError(getResponse({}, {}, 403), errors);

        expect(error.status).toBe(403);
        expect(error.errors).toEqual(errors);
        expect(error.name).toBe('GraphQLRequestError');
        expect(error.type).toBe('graphql_request');
    });
});
