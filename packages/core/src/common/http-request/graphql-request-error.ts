import { Response } from '@bigcommerce/request-sender';

import { StandardError } from '../error/errors';

export interface GraphQLError {
    message: string;
    path?: ReadonlyArray<string | number>;
    extensions?: Record<string, unknown>;
}

/**
 * Throw this error when a GraphQL request completes with errors in its
 * response body, or when the response is missing the expected data payload.
 */
export default class GraphQLRequestError extends StandardError {
    status: number;
    errors: GraphQLError[];

    constructor(response: Response<unknown>, errors: GraphQLError[] = []) {
        super(
            errors[0]?.message ||
                'An unexpected error has occurred while executing a GraphQL request.',
        );

        this.name = 'GraphQLRequestError';
        this.type = 'graphql_request';
        this.status = response.status;
        this.errors = errors;
    }
}
