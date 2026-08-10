import { RequestSender, Response } from '@bigcommerce/request-sender';

import { MissingDataError, MissingDataErrorType } from '../common/error/errors';
import {
    ContentType,
    GraphQLError,
    GraphQLRequestError,
    isResponse,
    RequestOptions,
} from '../common/http-request';

export interface B2BStorefrontTokenRequestBody {
    storeHash: string;
    channelId: number;
    expiresAt: number;
    allowedCorsOrigins: string[];
}

interface B2BStorefrontTokenResponseBody {
    data?: {
        storeFrontToken?: {
            token: string;
        } | null;
    };
    errors?: GraphQLError[];
}

const STOREFRONT_TOKEN_MUTATION =
    'mutation storeFrontToken($storeFrontTokenData: CustomerStoreFrontTokenInputType!) { storeFrontToken(storeFrontTokenData: $storeFrontTokenData) { token } }';

export default class B2BStorefrontTokenRequestSender {
    constructor(private _requestSender: RequestSender) {}

    async createStorefrontToken(
        b2bToken: string,
        b2bBaseUrl: string,
        storeFrontTokenData: B2BStorefrontTokenRequestBody,
        options?: RequestOptions,
    ): Promise<string> {
        let response: Response<B2BStorefrontTokenResponseBody>;

        try {
            response = await this._requestSender.post<B2BStorefrontTokenResponseBody>(
                `${b2bBaseUrl}/graphql`,
                {
                    credentials: false,
                    timeout: options?.timeout,
                    headers: {
                        Authorization: `Bearer ${b2bToken}`,
                        'Content-Type': ContentType.Json,
                    },
                    body: {
                        query: STOREFRONT_TOKEN_MUTATION,
                        variables: { storeFrontTokenData },
                    },
                },
            );
        } catch (error) {
            if (isResponse<B2BStorefrontTokenResponseBody>(error)) {
                throw new GraphQLRequestError(error, error.body?.errors);
            }

            throw error;
        }

        const { data, errors } = response.body;

        if (errors && errors.length > 0) {
            throw new GraphQLRequestError(response, errors);
        }

        const token = data?.storeFrontToken?.token;

        if (!token) {
            throw new MissingDataError(MissingDataErrorType.MissingB2BStorefrontToken);
        }

        return token;
    }
}
