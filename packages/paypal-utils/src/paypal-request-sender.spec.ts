import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';

import {
    ContentType,
    INTERNAL_USE_ONLY,
    SDK_VERSION_HEADERS,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { getResponse } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import PayPalRequestSender from './paypal-request-sender';

describe('PayPalRequestSender', () => {
    let requestSender: RequestSender;
    let paypalRequestSender: PayPalRequestSender;

    beforeEach(() => {
        requestSender = createRequestSender();
        paypalRequestSender = new PayPalRequestSender(requestSender);

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

        await paypalRequestSender.createOrder('paypalcommerce', requestBody);

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

        await paypalRequestSender.updateOrder('paypalcommerce', updateOrderRequestBody);

        expect(requestSender.put).toHaveBeenCalledWith(
            '/api/storefront/initialization/paypalcommerce',
            expect.objectContaining({
                body: updateOrderRequestBody,
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

        await paypalRequestSender.getOrderStatus('paypalcommercealternativemethods', {
            params: { useMetaData: true },
        });

        expect(requestSender.get).toHaveBeenCalledWith(
            '/api/storefront/initialization/paypalcommercealternativemethods',
            expect.objectContaining({
                headers,
            }),
        );
    });
});
