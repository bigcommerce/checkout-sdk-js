import { RequestSender, Response } from '@bigcommerce/request-sender';

import { PaymentMethodCancelledError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { GraphQLRequestOptions } from '../graphql-request-options';

import {
    CreatePaymentOrderIntentInputData,
    CreatePaymentOrderIntentResponse,
    CreatePaymentOrderIntentResponseBody,
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
}
