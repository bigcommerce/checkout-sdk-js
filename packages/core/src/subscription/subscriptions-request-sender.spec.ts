import { createRequestSender, createTimeout, RequestSender } from '@bigcommerce/request-sender';
import { getResponse } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import { ContentType, SDK_VERSION_HEADERS } from '../common/http-request';

import { Subscriptions } from './subscriptions';
import SubscriptionsRequestSender from './subscriptions-request-sender';

describe('SubscriptionsRequestSender', () => {
    let subscriptionsRequestSender: SubscriptionsRequestSender;
    let requestSender: RequestSender;

    beforeEach(() => {
        requestSender = createRequestSender();

        jest.spyOn(requestSender, 'post').mockResolvedValue(getResponse({}));

        subscriptionsRequestSender = new SubscriptionsRequestSender(requestSender);
    });

    describe('#updateSubscriptions()', () => {
        const subscriptionsRequestBody: Subscriptions = {
            acceptsAbandonedCartEmails: true,
            acceptsMarketingNewsletter: false,
            email: 'foo@bar.com',
        };

        it('signs out customer', async () => {
            await subscriptionsRequestSender.updateSubscriptions(subscriptionsRequestBody);

            expect(requestSender.post).toHaveBeenCalledWith('/api/storefront/subscriptions', {
                body: subscriptionsRequestBody,
                headers: {
                    Accept: ContentType.JsonV1,
                    ...SDK_VERSION_HEADERS,
                },
                timeout: undefined,
            });
        });

        it('signs out customer with timeout', async () => {
            const options = { timeout: createTimeout() };

            await subscriptionsRequestSender.updateSubscriptions(subscriptionsRequestBody, options);

            expect(requestSender.post).toHaveBeenCalledWith('/api/storefront/subscriptions', {
                ...options,
                body: subscriptionsRequestBody,
                headers: {
                    Accept: ContentType.JsonV1,
                    ...SDK_VERSION_HEADERS,
                },
            });
        });
    });
});
