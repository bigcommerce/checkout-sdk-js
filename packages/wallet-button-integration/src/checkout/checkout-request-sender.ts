import { RequestSender, Response } from '@bigcommerce/request-sender';

import { GraphQLRequestOptions } from '../graphql-request-options';

import {
    CreateRedirectToCheckoutResponse,
    CreateRedirectToCheckoutResponseBody,
    RedirectToCheckoutUrlInputData,
} from './checkout';
import CheckoutRedirectError from './checkout-redirect-error';

export class CheckoutRequestSender {
    constructor(private readonly requestSender: RequestSender) {}

    async getRedirectToCheckoutUrl(
        graphQLEndpoint: string,
        inputData: RedirectToCheckoutUrlInputData,
        options?: GraphQLRequestOptions,
    ): Promise<Response<CreateRedirectToCheckoutResponseBody>> {
        const document = `
            mutation CheckoutRedirectMutation($input: CreateCartRedirectUrlsInput!) {
                cart {
                    createCartRedirectUrls(input: $input) {
                        errors {
                         __typename
                        ... on NotFoundError {
                                message  
                            }
                        ... on CreateRedirectUrlsCurrencyNotAllowed {
                                message
                            }
                        }
                        redirectUrls {
                            externalCheckoutUrl
                        }
                    }
                }
            }
        `;

        const requestOptions: GraphQLRequestOptions = {
            headers: {
                ...options?.headers,
                'Content-Type': 'application/json',
                'x-catalyst-graphql-proxy-requester': 'checkout-sdk-js',
            },
            body: {
                query: document,
                variables: {
                    input: inputData,
                },
            },
        };

        try {
            const response = await this.requestSender.post<CreateRedirectToCheckoutResponse>(
                `${window.location.origin}/${graphQLEndpoint}`,
                requestOptions,
            );

            const {
                data: {
                    cart: { createCartRedirectUrls },
                },
            } = response.body;

            const errorMessage = createCartRedirectUrls.errors[0]?.message;

            if (errorMessage) {
                throw new CheckoutRedirectError(errorMessage);
            }

            if (createCartRedirectUrls.errors.length > 0) {
                throw new CheckoutRedirectError();
            }

            return {
                ...response,
                body: {
                    redirectUrls: createCartRedirectUrls.redirectUrls,
                },
            };
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }

            throw new Error('Checkout redirection failed');
        }
    }
}
