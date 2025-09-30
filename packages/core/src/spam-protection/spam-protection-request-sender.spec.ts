import { createRequestSender, createTimeout, RequestSender } from '@bigcommerce/request-sender';

import { EmptyCartError } from '../cart/errors';
import { getCheckout } from '../checkout/checkouts.mock';
import { ContentType, SDK_VERSION_HEADERS } from '../common/http-request';
import { getErrorResponse, getResponse } from '../common/http-request/responses.mock';

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
            expect(requestSender.post).toHaveBeenCalledWith(
                '/api/storefront/checkouts/checkoutId1234/spam-protection',
                {
                    headers: {
                        Accept: ContentType.JsonV1,
                        ...SDK_VERSION_HEADERS,
                    },
                    body: {
                        token,
                    },
                },
            );
        });

        it('validates spam protection with timeout', async () => {
            const options = { timeout: createTimeout() };
            const response = getResponse(getCheckout());

            jest.spyOn(requestSender, 'post').mockReturnValue(Promise.resolve(response));

            const output = await spamProtectionRequestSender.validate(checkoutId, token, options);

            expect(output).toEqual(response);
            expect(requestSender.post).toHaveBeenCalledWith(
                '/api/storefront/checkouts/checkoutId1234/spam-protection',
                {
                    ...options,
                    headers: {
                        Accept: ContentType.JsonV1,
                        ...SDK_VERSION_HEADERS,
                    },
                    body: {
                        token,
                    },
                },
            );
        });

        it('throws `EmptyCartError` if error type is `empty_cart`', async () => {
            const error = getErrorResponse(
                {
                    status: 422,
                    title: 'The request could not process',
                    type: 'empty_cart',
                },
                undefined,
                409,
            );

            jest.spyOn(requestSender, 'post').mockReturnValue(Promise.reject(error));

            await expect(spamProtectionRequestSender.validate(checkoutId, token)).rejects.toThrow(
                EmptyCartError,
            );
        });
    });
});
