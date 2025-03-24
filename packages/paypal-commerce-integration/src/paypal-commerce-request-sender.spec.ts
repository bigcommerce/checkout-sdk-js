import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';

import {
    ContentType,
    INTERNAL_USE_ONLY,
    SDK_VERSION_HEADERS,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { getResponse } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import PayPalCommerceRequestSender from './paypal-commerce-request-sender';

describe('PayPalCommerceRequestSender', () => {
    let requestSender: RequestSender;
    let paypalCommerceRequestSender: PayPalCommerceRequestSender;

    beforeEach(() => {
        requestSender = createRequestSender();
        paypalCommerceRequestSender = new PayPalCommerceRequestSender(requestSender);

        const requestResponseMock = getResponse({ orderId: 123 });

        jest.spyOn(requestSender, 'get').mockReturnValue(Promise.resolve(requestResponseMock));
        jest.spyOn(requestSender, 'post').mockReturnValue(Promise.resolve(requestResponseMock));
        jest.spyOn(requestSender, 'put').mockReturnValue(Promise.resolve(requestResponseMock));
    });

    it('creates order with provided data', async () => {
        const requestBody = {
            cartId: 'abc',
            instrumentId: 'vaultedInstrumentId',
        };

        await paypalCommerceRequestSender.createOrder('paypalcommerce', requestBody);

        const headers = {
            'X-API-INTERNAL': INTERNAL_USE_ONLY,
            'Content-Type': ContentType.Json,
            ...SDK_VERSION_HEADERS,
        };

        expect(requestSender.post).toHaveBeenCalledWith(
            '/api/storefront/payment/paypalcommerce',
            expect.objectContaining({
                body: requestBody,
                headers,
            }),
        );
    });

    it('update order with provided data', async () => {
        const shippingOptionMock = {
            additionalDescription: 'Additional description',
            description: 'Main description',
            id: '1',
            isRecommended: true,
            imageUrl: '',
            cost: 1,
            transitTime: '123',
            type: 'type',
        };

        const headers = {
            'X-API-INTERNAL': INTERNAL_USE_ONLY,
            'Content-Type': ContentType.Json,
            ...SDK_VERSION_HEADERS,
        };

        const updateOrderRequestBody = {
            availableShippingOptions: [shippingOptionMock],
            cartId: 'abc',
            selectedShippingOption: shippingOptionMock,
        };

        await paypalCommerceRequestSender.updateOrder(updateOrderRequestBody);

        expect(requestSender.put).toHaveBeenCalledWith(
            '/api/storefront/initialization/paypalcommerce',
            expect.objectContaining({
                body: updateOrderRequestBody,
                headers,
            }),
        );
    });

    it('requests order status', async () => {
        const headers = {
            'X-API-INTERNAL': INTERNAL_USE_ONLY,
            'Content-Type': ContentType.Json,
            ...SDK_VERSION_HEADERS,
        };

        await paypalCommerceRequestSender.getOrderStatus();

        expect(requestSender.get).toHaveBeenCalledWith(
            '/api/storefront/initialization/paypalcommerce',
            expect.objectContaining({
                headers,
            }),
        );
    });

    it('requests order status with proper data', async () => {
        const headers = {
            'X-API-INTERNAL': INTERNAL_USE_ONLY,
            'Content-Type': ContentType.Json,
            ...SDK_VERSION_HEADERS,
        };

        await paypalCommerceRequestSender.getOrderStatus('paypalcommercealternativemethods', {
            params: { useMetaData: true },
        });

        expect(requestSender.get).toHaveBeenCalledWith(
            '/api/storefront/initialization/paypalcommercealternativemethods',
            expect.objectContaining({
                headers,
            }),
        );
    });

    describe('#createPaymentOrderIntent', () => {
        const requestBody = {
            walletEntityId: 'paypalcommerce.paypal',
            cartId: '12341234',
        };

        const mockRequest = ({
            orderId = '10',
            errors = [],
        }: {
            orderId?: string;
            errors?: Array<{ message: string }>;
        } = {}) => {
            const requestResponseMock = getResponse({
                data: {
                    payment: {
                        paymentWallet: {
                            createPaymentWalletIntent: {
                                paymentWalletIntentData: { orderId },
                                errors,
                            },
                        },
                    },
                },
            });

            jest.spyOn(requestSender, 'post').mockReturnValue(Promise.resolve(requestResponseMock));
        };

        beforeEach(() => {
            mockRequest();
        });

        it('should throw an error', async () => {
            mockRequest({ errors: [{ message: 'error message' }] });

            try {
                await paypalCommerceRequestSender.createPaymentOrderIntent(
                    requestBody.walletEntityId,
                    requestBody.cartId,
                );
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
                expect((error as Error).message).toBe('error message');
            }
        });

        describe('create order', () => {
            it('with provided data', async () => {
                await paypalCommerceRequestSender.createPaymentOrderIntent(
                    requestBody.walletEntityId,
                    requestBody.cartId,
                );

                expect(requestSender.post).toHaveBeenCalledWith(
                    'http://localhost/api/wallet-buttons/create-payment-wallet-intent',
                    expect.objectContaining({
                        body: requestBody,
                    }),
                );
            });
        });
    });

    describe('#getRedirectToCheckoutUrl', () => {
        const url = 'https://example.com';
        const redirectedCheckoutUrl = 'https://redirect-to-checkout.com';

        const mockRequest = ({
            createCartRedirectUrls = { redirectUrls: { redirectedCheckoutUrl } },
        }: {
            createCartRedirectUrls?: { redirectUrls: { redirectedCheckoutUrl: string } | null };
        } = {}) => {
            const requestResponseMock = getResponse({
                data: {
                    cart: {
                        createCartRedirectUrls,
                    },
                },
            });

            jest.spyOn(requestSender, 'get').mockReturnValue(Promise.resolve(requestResponseMock));
        };

        it('get redirect to checkout url', async () => {
            mockRequest();

            const redirectToCheckoutUrl =
                await paypalCommerceRequestSender.getRedirectToCheckoutUrl(url);

            expect(requestSender.get).toHaveBeenCalledWith(url, undefined);

            expect(redirectToCheckoutUrl).toEqual(redirectedCheckoutUrl);
        });

        it('should throw an error if there is no redirect url', async () => {
            mockRequest({
                createCartRedirectUrls: {
                    redirectUrls: null,
                },
            });

            try {
                await paypalCommerceRequestSender.getRedirectToCheckoutUrl(url);
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
                expect((error as Error).message).toBe('Failed to redirection to checkout page');
            }
        });
    });
});
