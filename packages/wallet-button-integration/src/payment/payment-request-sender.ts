import { RequestSender, Response } from '@bigcommerce/request-sender';

import { PaymentMethodCancelledError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { GraphQLRequestOptions } from '../graphql-request-options';

import {
    CreatePaymentOrderIntentInputData,
    CreatePaymentOrderIntentResponse,
    CreatePaymentOrderIntentResponseBody,
    CreateRedirectToCheckoutResponse,
    CreateRedirectToCheckoutResponseBody,
    RedirectToCheckoutUrlInputData,
} from './payment';
import PaymentOrderCreationError from './payment-order-intent-creation-error';

export class PaymentRequestSender {
    constructor(private readonly requestSender: RequestSender) {}

    async createPaymentOrderIntent(
        graphQLEndpoint: string,
        inputData: CreatePaymentOrderIntentInputData,
        options?: GraphQLRequestOptions,
    ): Promise<Response<CreatePaymentOrderIntentResponseBody>> {
        const document = `
            mutation CreatePaymentWalletIntentMutation(
                $input: CreatePaymentWalletIntentInput!
            ) {
                payment {
                    paymentWallet {
                        createPaymentWalletIntent(input: $input) {
                            paymentWalletIntentData {
                                __typename
                            ... on PayPalCommercePaymentWalletIntentData {
                                    orderId
                                    approvalUrl
                                    initializationEntityId
                                }
                            }
                            errors {
                                __typename
                            ... on CreatePaymentWalletIntentGenericError {
                                    message
                                }
                            ... on Error {
                                    message
                                }
                            }
                        }
                    }
                }
            }
        `;

        const requestOptions: GraphQLRequestOptions = {
            headers: {
                ...options?.headers,
                'Content-Type': 'application/json',
            },
            body: {
                ...options?.body,
                document,
                variables: JSON.stringify({
                    input: inputData,
                }),
            },
        };

        try {
            const response = await this.requestSender.post<CreatePaymentOrderIntentResponse>(
                `${window.location.origin}/${graphQLEndpoint}`,
                requestOptions,
            );

            const {
                data: {
                    payment: {
                        paymentWallet: {
                            createPaymentWalletIntent: { paymentWalletIntentData, errors },
                        },
                    },
                },
            } = response.body;

            const errorMessage = errors[0]?.message;

            if (errorMessage) {
                throw new PaymentOrderCreationError(errorMessage);
            }

            return {
                ...response,
                body: {
                    ...paymentWalletIntentData,
                },
            };
        } catch (error) {
            if (!(error instanceof PaymentOrderCreationError)) {
                throw new PaymentMethodCancelledError();
            }

            throw error;
        }
    }

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
                        ... on NotFoundError {
                                __typename
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
            },
            body: {
                ...options?.body,
                document,
                variables: JSON.stringify({
                    input: inputData,
                }),
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

            return {
                ...response,
                body: {
                    ...createCartRedirectUrls,
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
