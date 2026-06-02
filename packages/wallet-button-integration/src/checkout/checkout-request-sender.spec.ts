import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';

import { CreateRedirectToCheckoutResponse, RedirectToCheckoutUrlInputData } from './checkout';
import CheckoutRedirectError from './checkout-redirect-error';
import { CheckoutRequestSender } from './checkout-request-sender';

describe('CheckoutRequestSender', () => {
    let requestSender: RequestSender;
    let checkoutRequestSender: CheckoutRequestSender;

    const graphQLEndpoint = 'graphql';

    const inputData: RedirectToCheckoutUrlInputData = {
        paymentWalletData: {
            providerId: 'paypalcommerce',
            providerOrderId: 'order-id-123',
        },
        cartEntityId: 'cart-entity-id-123',
        queryParams: [{ key: 'foo', value: 'bar' }],
    };

    const successResponseBody: CreateRedirectToCheckoutResponse = {
        data: {
            cart: {
                createCartRedirectUrls: {
                    errors: [],
                    redirectUrls: {
                        externalCheckoutUrl: 'https://store.example.com/checkout',
                    },
                },
            },
        },
    };

    beforeEach(() => {
        requestSender = createRequestSender();
        checkoutRequestSender = new CheckoutRequestSender(requestSender);
    });

    describe('#getRedirectToCheckoutUrl()', () => {
        it('sends a POST request to the correct endpoint', async () => {
            jest.spyOn(requestSender, 'post').mockResolvedValue({
                body: successResponseBody,
                status: 200,
                statusText: 'OK',
                headers: { 'content-type': 'application/json' },
            });

            await checkoutRequestSender.getRedirectToCheckoutUrl(graphQLEndpoint, inputData);

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

            await checkoutRequestSender.getRedirectToCheckoutUrl(graphQLEndpoint, inputData);

            expect(postSpy.mock.calls[0][1]).toMatchObject({
                body: { variables: { input: inputData } },
            });
        });

        it('returns transformed response body with redirectUrls', async () => {
            jest.spyOn(requestSender, 'post').mockResolvedValue({
                body: successResponseBody,
                status: 200,
                statusText: 'OK',
                headers: { 'content-type': 'application/json' },
            });

            const response = await checkoutRequestSender.getRedirectToCheckoutUrl(
                graphQLEndpoint,
                inputData,
            );

            expect(response.body).toEqual({
                redirectUrls: { externalCheckoutUrl: 'https://store.example.com/checkout' },
            });
        });

        it('returns null redirectUrls when createCartRedirectUrls has no redirectUrls', async () => {
            const nullRedirectResponse: CreateRedirectToCheckoutResponse = {
                data: {
                    cart: {
                        createCartRedirectUrls: {
                            errors: [],
                            redirectUrls: null,
                        },
                    },
                },
            };

            jest.spyOn(requestSender, 'post').mockResolvedValue({
                body: nullRedirectResponse,
                status: 200,
                statusText: 'OK',
                headers: { 'content-type': 'application/json' },
            });

            const response = await checkoutRequestSender.getRedirectToCheckoutUrl(
                graphQLEndpoint,
                inputData,
            );

            expect(response.body).toEqual({ redirectUrls: null });
        });

        it('merges custom headers with the required headers', async () => {
            jest.spyOn(requestSender, 'post').mockResolvedValue({
                body: successResponseBody,
                status: 200,
                statusText: 'OK',
                headers: { 'content-type': 'application/json' },
            });

            const customOptions = { headers: { Authorization: 'Bearer token-123' } };

            await checkoutRequestSender.getRedirectToCheckoutUrl(
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

        it('rethrows the original error when request fails with an Error instance', async () => {
            const networkError = new Error('Network error');

            jest.spyOn(requestSender, 'post').mockRejectedValue(networkError);

            await expect(
                checkoutRequestSender.getRedirectToCheckoutUrl(graphQLEndpoint, inputData),
            ).rejects.toThrow('Network error');
        });

        it('throws a generic error when request fails with a non-Error value', async () => {
            jest.spyOn(requestSender, 'post').mockRejectedValue('unexpected failure');

            await expect(
                checkoutRequestSender.getRedirectToCheckoutUrl(graphQLEndpoint, inputData),
            ).rejects.toThrow('Checkout redirection failed');
        });

        it('throws CheckoutRedirectError when GraphQL mutation returns a message error', async () => {
            const responseWithMessageError: CreateRedirectToCheckoutResponse = {
                data: {
                    cart: {
                        createCartRedirectUrls: {
                            errors: [
                                {
                                    __typename: 'CreateCartRedirectUrlsError',
                                    message: 'Cart not found',
                                },
                            ],
                            redirectUrls: null,
                        },
                    },
                },
            };

            jest.spyOn(requestSender, 'post').mockResolvedValue({
                body: responseWithMessageError,
                status: 200,
                statusText: 'OK',
                headers: { 'content-type': 'application/json' },
            });

            await expect(
                checkoutRequestSender.getRedirectToCheckoutUrl(graphQLEndpoint, inputData),
            ).rejects.toEqual(expect.any(CheckoutRedirectError));
        });

        it('throws default CheckoutRedirectError when GraphQL mutation returns a typeless error message', async () => {
            const responseWithTypenameOnlyError: CreateRedirectToCheckoutResponse = {
                data: {
                    cart: {
                        createCartRedirectUrls: {
                            errors: [{ __typename: 'NotFoundError' }],
                            redirectUrls: null,
                        },
                    },
                },
            };

            jest.spyOn(requestSender, 'post').mockResolvedValue({
                body: responseWithTypenameOnlyError,
                status: 200,
                statusText: 'OK',
                headers: { 'content-type': 'application/json' },
            });

            await expect(
                checkoutRequestSender.getRedirectToCheckoutUrl(graphQLEndpoint, inputData),
            ).rejects.toEqual(expect.any(CheckoutRedirectError));
        });
    });
});
