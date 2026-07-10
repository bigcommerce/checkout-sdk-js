import { RequestSender, Response } from '@bigcommerce/request-sender';
import { DocumentTypeDecoration } from '@graphql-typed-document-node/core';

import ContentType from './content-type';
import GraphQLRequestError, { GraphQLError } from './graphql-request-error';
import RequestOptions from './request-options';
import { SDK_VERSION_HEADERS } from './sdk-version-headers';

export interface GraphQLRequestOptions extends RequestOptions {
    /**
     * The bearer token used to authorize the request.
     */
    token: string;

    /**
     * The path of the GraphQL endpoint. Defaults to `/graphql`.
     */
    endpoint?: string;
}

export type GraphQLDocument<TData, TVariables> = DocumentTypeDecoration<TData, TVariables> & {
    toString(): string;
};

interface GraphQLResponseBody<TData> {
    data?: TData;
    errors?: GraphQLError[];
}

export default class GraphQLRequestSender {
    constructor(private _requestSender: RequestSender) {}

    async query<TData, TVariables>(
        document: GraphQLDocument<TData, TVariables>,
        variables: TVariables,
        options: GraphQLRequestOptions,
    ): Promise<TData> {
        const { token, endpoint = '/graphql', timeout } = options;

        let response: Response<GraphQLResponseBody<TData>>;

        try {
            response = await this._requestSender.post<GraphQLResponseBody<TData>>(endpoint, {
                timeout,
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': ContentType.Json,
                    ...SDK_VERSION_HEADERS,
                },
                body: {
                    query: document.toString(),
                    variables,
                },
            });
        } catch (error) {
            if (this._isResponse(error)) {
                throw new GraphQLRequestError(error, error.body?.errors);
            }

            throw error;
        }

        const { data, errors } = response.body;

        if (errors && errors.length > 0) {
            throw new GraphQLRequestError(response, errors);
        }

        if (!data) {
            throw new GraphQLRequestError(response);
        }

        return data;
    }

    private _isResponse(
        value: unknown,
    ): value is Response<GraphQLResponseBody<unknown> | undefined> {
        return typeof value === 'object' && value !== null && 'status' in value && 'body' in value;
    }
}
