import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';

import { SDK_VERSION_HEADERS } from '../common/http-request';

import B2BTokenRequestSender from './b2b-token-request-sender';

describe('B2BTokenRequestSender', () => {
    let requestSender: RequestSender;
    let b2bTokenRequestSender: B2BTokenRequestSender;

    beforeEach(() => {
        requestSender = createRequestSender();

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        jest.spyOn(requestSender, 'get').mockResolvedValue({ body: { token: 'bc-jwt-token' } });

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        jest.spyOn(requestSender, 'post').mockResolvedValue({
            body: { code: 200, data: { token: 'b2b-token-value' } },
        });

        b2bTokenRequestSender = new B2BTokenRequestSender(requestSender);
    });

    describe('#getBCJWT()', () => {
        it('sends GET to /customer/current.jwt with app_client_id param', async () => {
            await b2bTokenRequestSender.getBCJWT('my-client-id');

            expect(requestSender.get).toHaveBeenCalledWith('/customer/current.jwt', {
                params: { app_client_id: 'my-client-id' },
                headers: SDK_VERSION_HEADERS,
                timeout: undefined,
            });
        });

        it('passes timeout option through', async () => {
            const timeout = {};

            await b2bTokenRequestSender.getBCJWT('my-client-id', { timeout: timeout as any });

            expect(requestSender.get).toHaveBeenCalledWith(
                '/customer/current.jwt',
                expect.objectContaining({ timeout }),
            );
        });
    });

    describe('#exchangeForB2BToken()', () => {
        it('posts to B2B login endpoint with correct payload', async () => {
            await b2bTokenRequestSender.exchangeForB2BToken('bc-jwt', 123, 'abc123', 1);

            expect(requestSender.post).toHaveBeenCalledWith(
                'https://api-b2b.bigcommerce.com/api/v2/login',
                {
                    headers: { 'Content-Type': 'application/json' },
                    body: {
                        bcToken: 'bc-jwt',
                        customerId: '123',
                        storeHash: 'abc123',
                        channelId: '1',
                    },
                    timeout: undefined,
                },
            );
        });
    });
});
