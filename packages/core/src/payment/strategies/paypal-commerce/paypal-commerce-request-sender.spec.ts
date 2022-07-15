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
            jest.spyOn(requestSender, 'post')
                .mockImplementation(jest.fn().mockReturnValue(Promise.resolve({
                    body: {
                        orderId: '123',
                        approveUrl: 'url',
                    },
                })));
        });

        it('create order from cart page with paypalcommerce', async () => {
            await paypalCommerceRequestSender.setupPayment('abc', { isCredit: false });

            const headers = {
                'X-API-INTERNAL': INTERNAL_USE_ONLY,
                'Content-Type': ContentType.Json,
                ...SDK_VERSION_HEADERS,
            };

            expect(requestSender.post).toHaveBeenCalledWith('/api/storefront/payment/paypalcommerce', expect.objectContaining({
                body: {cartId: 'abc'},
                headers,
            }));
        });

        it('set shipping options', async () => {
            const setShippingDataMock = {
                amount: {
                    breakdown: {
                        item_total: {
                            currency_code: 'USD',
                            value: '100',
                        },
                        shipping: {
                            currency_code: 'USD',
                            value: '100',
                        },
                        tax_total: {
                            currency_code: 'USD',
                            value: '100',
                        },
                    },
                    currency_code: 'USD',
                    value: '100',
                },
                orderID: '123',
                payment_token: 'PAYMENT_TOKEN',
                shipping_address: {
                    city: 'Los-Angeles',
                    postal_code: '08547',
                    country_code: 'US',
                    state: 'CA',
                },
                selected_shipping_option: {
                    id: '123',
                    amount: {
                        currency_code: 'USD',
                        value: '100',
                    },
                },
                availableShippingOptions: {},
                cartId: '1'
            };
            const headers = {
                'X-API-INTERNAL': INTERNAL_USE_ONLY,
                'Content-Type': ContentType.Json,
                ...SDK_VERSION_HEADERS,
            };

            const options = {
                body: {...setShippingDataMock},
                headers,
            };


           jest.spyOn(requestSender, 'put').mockReturnValue(Promise.resolve(options));
           await paypalCommerceRequestSender.setShippingOptions(setShippingDataMock);
           expect(requestSender.put).toHaveBeenCalledWith('/api/storefront/initialization/paypalcommerce', {body:{...setShippingDataMock}, headers})
        });

        it('create order from cart page with paypalcommerce credit', async () => {
            await paypalCommerceRequestSender.setupPayment('abc', { isCredit: true });

            const headers = {
                'X-API-INTERNAL': INTERNAL_USE_ONLY,
                'Content-Type': ContentType.Json,
                ...SDK_VERSION_HEADERS,
            };

            expect(requestSender.post).toHaveBeenCalledWith('/api/storefront/payment/paypalcommercecredit', expect.objectContaining({
                body: {cartId: 'abc'},
                headers,
            }));
        });

        it('create order from checkout page with paypalcommerce', async () => {
            await paypalCommerceRequestSender.setupPayment('abc', { isCheckout: true });

            const headers = {
                'X-API-INTERNAL': INTERNAL_USE_ONLY,
                'Content-Type': ContentType.Json,
                ...SDK_VERSION_HEADERS,
            };

            expect(requestSender.post).toHaveBeenCalledWith('/api/storefront/payment/paypalcommercecheckout', expect.objectContaining({
                body: {cartId: 'abc'},
                headers,
            }));
        });

        it('create order from checkout page with paypalcommerce credit', async () => {
            await paypalCommerceRequestSender.setupPayment('abc', { isCredit: true, isCheckout: true });

            const headers = {
                'X-API-INTERNAL': INTERNAL_USE_ONLY,
                'Content-Type': ContentType.Json,
                ...SDK_VERSION_HEADERS,
            };

            expect(requestSender.post).toHaveBeenCalledWith('/api/storefront/payment/paypalcommercecreditcheckout', expect.objectContaining({
                body: {cartId: 'abc'},
                headers,
            }));
        });

        it('create order from checkout page with paypalcommerce credit card', async () => {
            await paypalCommerceRequestSender.setupPayment('abc', { isCreditCard: true });

            const headers = {
                'X-API-INTERNAL': INTERNAL_USE_ONLY,
                'Content-Type': ContentType.Json,
                ...SDK_VERSION_HEADERS,
            };

            expect(requestSender.post).toHaveBeenCalledWith('/api/storefront/payment/paypalcommercecreditcardscheckout', expect.objectContaining({
                body: {cartId: 'abc'},
                headers,
            }));
        });
        it('create order from checkout page for APM', async () => {
            paypalCommerceRequestSender = new PaypalCommerceRequestSender(requestSender);
            await paypalCommerceRequestSender.setupPayment('abc', { isCheckout: true, isAPM: true });

            const headers = {
                'X-API-INTERNAL': INTERNAL_USE_ONLY,
                'Content-Type': ContentType.Json,
                ...SDK_VERSION_HEADERS,
            };

            expect(requestSender.post).toHaveBeenCalledWith('/api/storefront/payment/paypalcommercealternativemethodscheckout', expect.objectContaining({
                body: {cartId: 'abc'},
                headers,
            }));
        });
    });
});
