import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';

import { ContentType, INTERNAL_USE_ONLY, SDK_VERSION_HEADERS } from '../../../common/http-request';

import { PaypalCommerceRequestSender } from './index';

describe('PaypalCommerceRequestSender', () => {
    let requestSender: RequestSender;
    let paypalCommerceRequestSender: PaypalCommerceRequestSender;

    beforeEach(() => {
        requestSender = createRequestSender();
        paypalCommerceRequestSender = new PaypalCommerceRequestSender(requestSender);
    });

    describe('setupPayment', () => {
        beforeEach(() => {
            jest.spyOn(requestSender, 'post').mockImplementation(
                jest.fn().mockReturnValue(
                    Promise.resolve({
                        body: {
                            orderId: '123',
                            approveUrl: 'url',
                        },
                    }),
                ),
            );
        });

        it('create order from cart page with paypalcommerce', async () => {
            await paypalCommerceRequestSender.setupPayment('abc', { isCredit: false });

            const headers = {
                'X-API-INTERNAL': INTERNAL_USE_ONLY,
                'Content-Type': ContentType.Json,
                ...SDK_VERSION_HEADERS,
            };

            expect(requestSender.post).toHaveBeenCalledWith(
                '/api/storefront/payment/paypalcommerce',
                expect.objectContaining({
                    body: { cartId: 'abc' },
                    headers,
                }),
            );
        });

        it('create order from cart page with paypalcommerce credit', async () => {
            await paypalCommerceRequestSender.setupPayment('abc', { isCredit: true });

            const headers = {
                'X-API-INTERNAL': INTERNAL_USE_ONLY,
                'Content-Type': ContentType.Json,
                ...SDK_VERSION_HEADERS,
            };

            expect(requestSender.post).toHaveBeenCalledWith(
                '/api/storefront/payment/paypalcommercecredit',
                expect.objectContaining({
                    body: { cartId: 'abc' },
                    headers,
                }),
            );
        });

        it('create order from checkout page with paypalcommerce', async () => {
            await paypalCommerceRequestSender.setupPayment('abc', { isCheckout: true });

            const headers = {
                'X-API-INTERNAL': INTERNAL_USE_ONLY,
                'Content-Type': ContentType.Json,
                ...SDK_VERSION_HEADERS,
            };

            expect(requestSender.post).toHaveBeenCalledWith(
                '/api/storefront/payment/paypalcommercecheckout',
                expect.objectContaining({
                    body: { cartId: 'abc' },
                    headers,
                }),
            );
        });

        it('create order from checkout page with paypalcommerce credit', async () => {
            await paypalCommerceRequestSender.setupPayment('abc', {
                isCredit: true,
                isCheckout: true,
            });

            const headers = {
                'X-API-INTERNAL': INTERNAL_USE_ONLY,
                'Content-Type': ContentType.Json,
                ...SDK_VERSION_HEADERS,
            };

            expect(requestSender.post).toHaveBeenCalledWith(
                '/api/storefront/payment/paypalcommercecreditcheckout',
                expect.objectContaining({
                    body: { cartId: 'abc' },
                    headers,
                }),
            );
        });

        it('create order from checkout page with paypalcommerce credit card', async () => {
            await paypalCommerceRequestSender.setupPayment('abc', { isCreditCard: true });

            const headers = {
                'X-API-INTERNAL': INTERNAL_USE_ONLY,
                'Content-Type': ContentType.Json,
                ...SDK_VERSION_HEADERS,
            };

            expect(requestSender.post).toHaveBeenCalledWith(
                '/api/storefront/payment/paypalcommercecreditcardscheckout',
                expect.objectContaining({
                    body: { cartId: 'abc' },
                    headers,
                }),
            );
        });

        it('create order from checkout page for APM', async () => {
            paypalCommerceRequestSender = new PaypalCommerceRequestSender(requestSender);
            await paypalCommerceRequestSender.setupPayment('abc', {
                isCheckout: true,
                isAPM: true,
            });

            const headers = {
                'X-API-INTERNAL': INTERNAL_USE_ONLY,
                'Content-Type': ContentType.Json,
                ...SDK_VERSION_HEADERS,
            };

            expect(requestSender.post).toHaveBeenCalledWith(
                '/api/storefront/payment/paypalcommercealternativemethodscheckout',
                expect.objectContaining({
                    body: { cartId: 'abc' },
                    headers,
                }),
            );
        });

        it('creates an order providing extra data to save vaulting instrument for paypal commerce', async () => {
            paypalCommerceRequestSender = new PaypalCommerceRequestSender(requestSender);
            await paypalCommerceRequestSender.createOrder('paypalcommerce', {
                cartId: 'abc',
                shouldSaveInstrument: true,
                shouldSetAsDefaultInstrument: true,
            });

            const headers = {
                'X-API-INTERNAL': INTERNAL_USE_ONLY,
                'Content-Type': ContentType.Json,
                ...SDK_VERSION_HEADERS,
            };

            expect(requestSender.post).toHaveBeenCalledWith(
                '/api/storefront/payment/paypalcommerce',
                {
                    headers,
                    body: {
                        cartId: 'abc',
                        shouldSaveInstrument: true,
                        shouldSetAsDefaultInstrument: true,
                    },
                },
            );
        });

        it('creates an order providing extra data to use vaulting instrument for paypal commerce', async () => {
            paypalCommerceRequestSender = new PaypalCommerceRequestSender(requestSender);
            await paypalCommerceRequestSender.createOrder('paypalcommerce', {
                cartId: 'abc',
                instrumentId: 'instrumentId',
            });

            const headers = {
                'X-API-INTERNAL': INTERNAL_USE_ONLY,
                'Content-Type': ContentType.Json,
                ...SDK_VERSION_HEADERS,
            };

            expect(requestSender.post).toHaveBeenCalledWith(
                '/api/storefront/payment/paypalcommerce',
                {
                    headers,
                    body: {
                        cartId: 'abc',
                        instrumentId: 'instrumentId',
                    },
                },
            );
        });
    });
});
