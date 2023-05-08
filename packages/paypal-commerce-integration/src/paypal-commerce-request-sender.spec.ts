import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';

import {
    ContentType,
    INTERNAL_USE_ONLY,
    SDK_VERSION_HEADERS,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import PayPalCommerceRequestSender from './paypal-commerce-request-sender';

describe('PayPalCommerceRequestSender', () => {
    let requestSender: RequestSender;
    let paypalCommerceRequestSender: PayPalCommerceRequestSender;

    beforeEach(() => {
        requestSender = createRequestSender();
        paypalCommerceRequestSender = new PayPalCommerceRequestSender(requestSender);

        const requestResponseMock = {
            body: {
                orderId: '123',
            },
        };

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
});
