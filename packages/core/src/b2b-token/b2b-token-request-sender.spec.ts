import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';

import { SDK_VERSION_HEADERS } from '../common/http-request';
import { getResponse } from '../common/http-request/responses.mock';

import B2BTokenRequestSender from './b2b-token-request-sender';

describe('B2BTokenRequestSender', () => {
    let requestSender: RequestSender;
    let b2bTokenRequestSender: B2BTokenRequestSender;

    const jwtToken = 'bc-jwt-token';
    const b2bToken = 'b2b-token-value';

    beforeEach(() => {
        requestSender = createRequestSender();

        jest.spyOn(requestSender, 'get').mockResolvedValue(getResponse({ token: jwtToken }));
        jest.spyOn(requestSender, 'post').mockResolvedValue(
            getResponse({ code: 200, data: { token: b2bToken } }),
        );

        b2bTokenRequestSender = new B2BTokenRequestSender(requestSender);
    });

    describe('#getB2BToken()', () => {
        it('fetches BC JWT then exchanges it for a B2B token', async () => {
            await b2bTokenRequestSender.getB2BToken(
                'my-client-id',
                123,
                'abc123',
                1,
                'https://api-b2b.bigcommerce.com',
            );

            expect(requestSender.get).toHaveBeenCalledWith('/customer/current.jwt', {
                params: { app_client_id: 'my-client-id' },
                headers: SDK_VERSION_HEADERS,
                timeout: undefined,
            });

            expect(requestSender.post).toHaveBeenCalledWith(
                'https://api-b2b.bigcommerce.com/api/v2/login',
                {
                    credentials: false,
                    headers: { 'Content-Type': 'application/json' },
                    body: {
                        bcToken: jwtToken,
                        customerId: 123,
                        storeHash: 'abc123',
                        channelId: 1,
                    },
                    timeout: undefined,
                },
            );
        });

        it('uses the provided b2bBaseUrl for the token exchange', async () => {
            await b2bTokenRequestSender.getB2BToken(
                'my-client-id',
                123,
                'abc123',
                1,
                'https://api-b2b.staging.zone',
            );

            expect(requestSender.post).toHaveBeenCalledWith(
                'https://api-b2b.staging.zone/api/v2/login',
                expect.objectContaining({
                    body: expect.objectContaining({ bcToken: jwtToken }),
                }),
            );
        });
    });
});
