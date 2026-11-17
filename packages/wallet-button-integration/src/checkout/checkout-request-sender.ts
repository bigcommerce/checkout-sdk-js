import { RequestSender, Response } from '@bigcommerce/request-sender';

import { GraphQLRequestOptions } from '../graphql-request-options';

import {
    CreateRedirectToCheckoutHandoffResponseBody,
    CreateRedirectToCheckoutResponse,
    CreateRedirectToCheckoutResponseBody,
    RedirectToCheckoutUrlInputData,
    RedirectUrls,
    RedirectUrlsWithCheckoutHandoff,
} from './checkout';
import CheckoutRedirectError from './checkout-redirect-error';

const CHECKOUT_HANDOFF_FIELDS = `
                            externalCheckoutHandoff {
                                url
                                method
                                fields {
                                    name
                                    value
                                }
                            }`;

export class CheckoutRequestSender {
    constructor(private readonly requestSender: RequestSender) {}

    async getRedirectToCheckoutUrl(
        graphQLEndpoint: string,
        inputData: RedirectToCheckoutUrlInputData,
        options?: GraphQLRequestOptions,
    ): Promise<Response<CreateRedirectToCheckoutResponseBody>> {
        return this.requestRedirectUrls<RedirectUrls>(graphQLEndpoint, inputData, options);
    }

    /**
     * The mutation is shared by every wallet button, so the handoff field is requested only
     * by strategies that need it. A store schema without it must not break the others.
     */
    async getRedirectToCheckoutHandoff(
        graphQLEndpoint: string,
        inputData: RedirectToCheckoutUrlInputData,
        options?: GraphQLRequestOptions,
    ): Promise<Response<CreateRedirectToCheckoutHandoffResponseBody>> {
        return this.requestRedirectUrls<RedirectUrlsWithCheckoutHandoff>(
            graphQLEndpoint,
            inputData,
            options,
            CHECKOUT_HANDOFF_FIELDS,
        );
    }

    private async requestRedirectUrls<TRedirectUrls extends RedirectUrls>(
        graphQLEndpoint: string,
        inputData: RedirectToCheckoutUrlInputData,
        options?: GraphQLRequestOptions,
        extraRedirectUrlsFields = '',
    ): Promise<Response<CreateRedirectToCheckoutResponseBody<TRedirectUrls>>> {
        const document = `
            mutation CheckoutRedirectMutation($input: CreateCartRedirectUrlsInput!) {
                cart {
                    createCartRedirectUrls(input: $input) {
                        errors {
                         __typename
                        ... on NotFoundError {
                                message
                            }
                        }
                        redirectUrls {
                            externalCheckoutUrl${extraRedirectUrlsFields}
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
            const response = await this.requestSender.post<
                CreateRedirectToCheckoutResponse<TRedirectUrls>
            >(`${window.location.origin}/${graphQLEndpoint}`, requestOptions);

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
