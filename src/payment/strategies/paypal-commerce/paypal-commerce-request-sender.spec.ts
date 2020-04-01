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

        it('create order (post request to server) when PayPalCommerce payment details are setup payment', async () => {
            await paypalCommerceRequestSender.setupPayment('abc');

            const headers = {
                'X-API-INTERNAL': INTERNAL_USE_ONLY,
                'Content-Type': ContentType.Json,
            };

            expect(requestSender.post).toHaveBeenCalledWith('/api/storefront/payment/paypalcommerce', expect.objectContaining({
                body: {cartId: 'abc'},
                headers,
            }));
        });
    });
});
