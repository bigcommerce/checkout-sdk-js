import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';

import { ContentType, INTERNAL_USE_ONLY, SDK_VERSION_HEADERS } from '../common/http-request';

import StorefrontPaymentRequestSender from './storefront-payment-request-sender';

describe('StorefrontPaymentRequestSender', () => {
    let requestSender: RequestSender;
    let storefrontPaymentRequestSender: StorefrontPaymentRequestSender;

    beforeEach(() => {
        requestSender = createRequestSender();
        storefrontPaymentRequestSender = new StorefrontPaymentRequestSender(requestSender);

        jest.spyOn(requestSender, 'post').mockResolvedValue(undefined);
    });

    describe('#saveExternalId', () => {
        const headers = {
            Accept: ContentType.JsonV1,
            'X-API-INTERNAL': INTERNAL_USE_ONLY,
            ...SDK_VERSION_HEADERS,
        };

        it('saves external id for Zip', async () => {
            await storefrontPaymentRequestSender.saveExternalId('zip', 'checkout_id');

            expect(requestSender.post).toHaveBeenCalledWith(
                '/api/storefront/payment/zip/save-external-id',
                {
                    body: {
                        externalId: 'checkout_id',
                        provider: 'zip',
                    },
                    headers,
                },
            );
        });

        it('saves external id for Quadpay', async () => {
            await storefrontPaymentRequestSender.saveExternalId('quadpay', 'checkout_id');

            expect(requestSender.post).toHaveBeenCalledWith(
                '/api/storefront/payment/quadpay/save-external-id',
                {
                    body: {
                        externalId: 'checkout_id',
                        provider: 'quadpay',
                    },
                    headers,
                },
            );
        });
    });
});
