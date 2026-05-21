import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';

import { CreatePaymentOrderIntentInputData, CreatePaymentOrderIntentResponse } from './payment';
import PaymentOrderCreationError from './payment-order-intent-creation-error';
import { PaymentRequestSender } from './payment-request-sender';

describe('PaymentRequestSender', () => {
    let requestSender: RequestSender;
    let paymentRequestSender: PaymentRequestSender;

    const graphQLEndpoint = 'graphql';

    const inputData: CreatePaymentOrderIntentInputData = {
        cartEntityId: 'cart-entity-id-123',
        paymentWalletEntityId: 'paypalcommerce',
    };

    const successResponseBody: CreatePaymentOrderIntentResponse = {
        data: {
            payment: {
                paymentWallet: {
                    createPaymentWalletIntent: {
                        errors: [],
                        paymentWalletIntentData: {
                            approvalUrl: 'https://www.paypal.com/approve?token=order-123',
                            orderId: 'order-123',
                            initializationEntityId: 'init-entity-123',
                        },
                    },
                },
            },
        },
    };

    beforeEach(() => {
        requestSender = createRequestSender();
        paymentRequestSender = new PaymentRequestSender(requestSender);
    });

    describe('#createPaymentOrderIntent()', () => {
        it('sends a POST request with the correct GraphQL mutation and input variables', async () => {
            jest.spyOn(requestSender, 'post').mockResolvedValue({
                body: successResponseBody,
                status: 200,
                statusText: 'OK',
                headers: { 'content-type': 'application/json' },
            });

            await paymentRequestSender.createPaymentOrderIntent(graphQLEndpoint, inputData);

            expect(requestSender.post).toHaveBeenCalledWith(
                `${window.location.origin}/${graphQLEndpoint}`,
                expect.objectContaining({
                    headers: {
                        'Content-Type': 'application/json',
                        'x-catalyst-graphql-proxy-requester': 'checkout-sdk-js',
                    },
                }),
            );
        });

        it('includes the correct variables in the request body', async () => {
            const postSpy = jest.spyOn(requestSender, 'post').mockResolvedValue({
                body: successResponseBody,
                status: 200,
                statusText: 'OK',
                headers: { 'content-type': 'application/json' },
            });

            await paymentRequestSender.createPaymentOrderIntent(graphQLEndpoint, inputData);

            expect(postSpy.mock.calls[0][1]).toMatchObject({
                body: { variables: { input: inputData } },
            });
        });

        it('returns transformed response body with orderId, approvalUrl, and initializationEntityId', async () => {
            jest.spyOn(requestSender, 'post').mockResolvedValue({
                body: successResponseBody,
                status: 200,
                statusText: 'OK',
                headers: { 'content-type': 'application/json' },
            });

            const response = await paymentRequestSender.createPaymentOrderIntent(
                graphQLEndpoint,
                inputData,
            );

            expect(response.body).toEqual({
                approvalUrl: 'https://www.paypal.com/approve?token=order-123',
                orderId: 'order-123',
                initializationEntityId: 'init-entity-123',
            });
        });

        it('throws PaymentOrderCreationError when response contains errors', async () => {
            const errorResponse: CreatePaymentOrderIntentResponse = {
                data: {
                    payment: {
                        paymentWallet: {
                            createPaymentWalletIntent: {
                                errors: [{ message: 'Cart not found' }],
                                paymentWalletIntentData: {
                                    approvalUrl: '',
                                    orderId: '',
                                    initializationEntityId: '',
                                },
                            },
                        },
                    },
                },
            };

            jest.spyOn(requestSender, 'post').mockResolvedValue({
                body: errorResponse,
                status: 200,
                statusText: 'OK',
                headers: { 'content-type': 'application/json' },
            });

            await expect(
                paymentRequestSender.createPaymentOrderIntent(graphQLEndpoint, inputData),
            ).rejects.toThrow(PaymentOrderCreationError);
        });

        it('throws PaymentOrderCreationError with the error message from the response', async () => {
            const errorMessage = 'Invalid cart entity ID';
            const errorResponse: CreatePaymentOrderIntentResponse = {
                data: {
                    payment: {
                        paymentWallet: {
                            createPaymentWalletIntent: {
                                errors: [{ message: errorMessage }],
                                paymentWalletIntentData: {
                                    approvalUrl: '',
                                    orderId: '',
                                    initializationEntityId: '',
                                },
                            },
                        },
                    },
                },
            };

            jest.spyOn(requestSender, 'post').mockResolvedValue({
                body: errorResponse,
                status: 200,
                statusText: 'OK',
                headers: { 'content-type': 'application/json' },
            });

            await expect(
                paymentRequestSender.createPaymentOrderIntent(graphQLEndpoint, inputData),
            ).rejects.toThrow(errorMessage);
        });

        it('throws PaymentMethodCancelledError when request fails with a non-PaymentOrderCreationError', async () => {
            jest.spyOn(requestSender, 'post').mockRejectedValue(new Error('Network error'));

            await expect(
                paymentRequestSender.createPaymentOrderIntent(graphQLEndpoint, inputData),
            ).rejects.toThrow('Payment process was cancelled.');
        });

        it('merges custom headers with Content-Type header', async () => {
            jest.spyOn(requestSender, 'post').mockResolvedValue({
                body: successResponseBody,
                status: 200,
                statusText: 'OK',
                headers: { 'content-type': 'application/json' },
            });

            const customOptions = {
                headers: { Authorization: 'Bearer token-123' },
            };

            await paymentRequestSender.createPaymentOrderIntent(
                graphQLEndpoint,
                inputData,
                customOptions,
            );

            expect(requestSender.post).toHaveBeenCalledWith(
                `${window.location.origin}/${graphQLEndpoint}`,
                expect.objectContaining({
                    headers: {
                        Authorization: 'Bearer token-123',
                        'Content-Type': 'application/json',
                        'x-catalyst-graphql-proxy-requester': 'checkout-sdk-js',
                    },
                }),
            );
        });
    });
});
