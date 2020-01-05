import { createRequestSender, createTimeout, RequestSender } from '@bigcommerce/request-sender';

import { getCheckout } from '../checkout/checkouts.mock';
import { ContentType } from '../common/http-request';
import { getResponse } from '../common/http-request/responses.mock';

import SpamProtectionRequestSender from './spam-protection-request-sender';

describe('SpamProtection Request Sender', () => {
    let spamProtectionRequestSender: SpamProtectionRequestSender;
    let requestSender: RequestSender;

    beforeEach(() => {
        requestSender = createRequestSender();
        spamProtectionRequestSender = new SpamProtectionRequestSender(requestSender);
    });

    it('spamProtectionRequestSender is defined', () => {
        expect(spamProtectionRequestSender).toBeDefined();
    });

    const checkoutId = 'checkoutId1234';
    const token = 'spamProtectionToken';

    describe('#validate()', () => {
        it('validates spam protection', async () => {
            const response = getResponse(getCheckout());
            jest.spyOn(requestSender, 'post').mockReturnValue(Promise.resolve(response));

            const output = await spamProtectionRequestSender.validate(checkoutId, token);

            expect(output).toEqual(response);
            expect(requestSender.post).toHaveBeenCalledWith('/api/storefront/checkouts/checkoutId1234/spam-protection', {
                headers: {
                    Accept: ContentType.JsonV1,
                },
                body: {
                    token,
                },
            });
        });

        it('validates spam protection with timeout', async () => {
            const options = { timeout: createTimeout() };
            const response = getResponse(getCheckout());
            jest.spyOn(requestSender, 'post').mockReturnValue(Promise.resolve(response));

            const output = await spamProtectionRequestSender.validate(checkoutId, token, options);

            expect(output).toEqual(response);
            expect(requestSender.post).toHaveBeenCalledWith('/api/storefront/checkouts/checkoutId1234/spam-protection', {
                ...options,
                headers: {
                    Accept: ContentType.JsonV1,
                },
                body: {
                    token,
                },
            });
        });
    });
});
