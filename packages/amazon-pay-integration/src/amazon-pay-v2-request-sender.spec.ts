import { RequestSender } from '@bigcommerce/request-sender';

import {
    ContentType,
    INTERNAL_USE_ONLY,
    SDK_VERSION_HEADERS,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import AmazonPayV2RequestSender from './amazon-pay-v2-request-sender';

describe('AmazonPayV2RequestSender', () => {
    let requestSenderMock: RequestSender;
    let amazonPayV2RequestSender: AmazonPayV2RequestSender;

    beforeEach(() => {
        requestSenderMock = {
            post: jest.fn(),
        } as unknown as RequestSender;

        amazonPayV2RequestSender = new AmazonPayV2RequestSender(requestSenderMock);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('createCheckoutConfig', async () => {
        await amazonPayV2RequestSender.createCheckoutConfig('cartId');

        expect(requestSenderMock.post).toHaveBeenCalledWith('/api/storefront/payment/amazonpay', {
            body: { cartId: 'cartId' },
            headers: {
                'X-API-INTERNAL': INTERNAL_USE_ONLY,
                'Content-Type': ContentType.Json,
                ...SDK_VERSION_HEADERS,
            },
        });
    });
});
