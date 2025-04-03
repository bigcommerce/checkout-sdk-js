import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import BraintreeRequestSender from './braintree-request-sender';
import { getResponse } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';
import { ContentType, INTERNAL_USE_ONLY, SDK_VERSION_HEADERS } from '@bigcommerce/checkout-sdk/payment-integration-api';

describe('BraintreeRequestSender', () => {
    let requestSender: RequestSender;
    let braintreeRequestSender: BraintreeRequestSender;

    beforeEach(() => {
        requestSender = createRequestSender();
        braintreeRequestSender = new BraintreeRequestSender(requestSender);

        const requestResponseMock = getResponse({ orderId: 123 });

        jest.spyOn(requestSender, 'get').mockReturnValue(Promise.resolve(requestResponseMock));
        jest.spyOn(requestSender, 'post').mockReturnValue(Promise.resolve(requestResponseMock));
        jest.spyOn(requestSender, 'put').mockReturnValue(Promise.resolve(requestResponseMock));
    });

    it('requests order status', async () => {
        const headers = {
            'X-API-INTERNAL': INTERNAL_USE_ONLY,
            'Content-Type': ContentType.Json,
            ...SDK_VERSION_HEADERS,
        };

        await braintreeRequestSender.getOrderStatus();

        expect(requestSender.get).toHaveBeenCalledWith(
            '/api/storefront/initialization/braintreelocalmethods',
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

        await braintreeRequestSender.getOrderStatus('braintreelocalmethods', {
            params: { useMetaData: false },
        });

        expect(requestSender.get).toHaveBeenCalledWith(
            '/api/storefront/initialization/braintreelocalmethods',
            expect.objectContaining({
                headers,
            }),
        );
    });
});
