import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';

import { ContentType, INTERNAL_USE_ONLY } from '../../../common/http-request';

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
            };

            expect(requestSender.post).toHaveBeenCalledWith('/api/storefront/payment/paypalcommerce', expect.objectContaining({
                body: {cartId: 'abc'},
                headers,
            }));
        });

        it('create order from cart page with paypalcommerce credit', async () => {
            await paypalCommerceRequestSender.setupPayment('abc', { isCredit: true });

            const headers = {
                'X-API-INTERNAL': INTERNAL_USE_ONLY,
                'Content-Type': ContentType.Json,
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
            };

            expect(requestSender.post).toHaveBeenCalledWith('/api/storefront/payment/paypalcommercecreditcardscheckout', expect.objectContaining({
                body: {cartId: 'abc'},
                headers,
            }));
        });
    });
});
