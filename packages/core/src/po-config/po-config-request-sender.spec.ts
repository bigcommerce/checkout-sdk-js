import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';

import { SDK_VERSION_HEADERS } from '../common/http-request';
import { getResponse } from '../common/http-request/responses.mock';

import PoConfigRequestSender, { PoConfigResponseBody } from './po-config-request-sender';

describe('PoConfigRequestSender', () => {
    let requestSender: RequestSender;
    let poConfigRequestSender: PoConfigRequestSender;

    const bcJwt = 'bc-jwt-token';
    const responseBody: PoConfigResponseBody = {
        code: 200,
        message: 'SUCCESS',
        data: {
            checkoutPaymentPurchaseEnableExtra: { id: 1, value: '1', type: 'checkbox' },
            checkoutPaymentPurchaseExtraFields: {
                id: 2,
                value: 'PO Number / Reference Number',
                type: 'text',
            },
            checkoutPaymentPurchaseExtraFieldsRequired: { id: 3, value: '1', type: 'checkbox' },
        },
    };

    beforeEach(() => {
        requestSender = createRequestSender();

        jest.spyOn(requestSender, 'get').mockImplementation(async (url) => {
            if (url === '/customer/current.jwt') {
                return getResponse({ token: bcJwt });
            }

            return getResponse(responseBody);
        });

        poConfigRequestSender = new PoConfigRequestSender(requestSender);
    });

    describe('#getPoConfig()', () => {
        it('GETs the store-configs endpoint at the supplied B2B base URL with auth headers when a B2B token is supplied', async () => {
            await poConfigRequestSender.getPoConfig(
                'my-client-id',
                'https://api-b2b.bigcommerce.com',
                'my-b2b-token',
            );

            expect(requestSender.get).toHaveBeenCalledWith(
                'https://api-b2b.bigcommerce.com/api/v2/store-configs/checkout',
                {
                    credentials: false,
                    headers: {
                        'Content-Type': 'application/json',
                        authToken: 'my-b2b-token',
                        Authorization: 'Bearer my-b2b-token',
                    },
                    timeout: undefined,
                },
            );
        });

        it('does not fetch the BC JWT when a B2B token is supplied', async () => {
            await poConfigRequestSender.getPoConfig(
                'my-client-id',
                'https://api-b2b.bigcommerce.com',
                'my-b2b-token',
            );

            expect(requestSender.get).not.toHaveBeenCalledWith(
                '/customer/current.jwt',
                expect.anything(),
            );
        });

        it('falls back to the BC JWT for authToken when no B2B token is supplied', async () => {
            await poConfigRequestSender.getPoConfig(
                'my-client-id',
                'https://api-b2b.bigcommerce.com',
                '',
            );

            expect(requestSender.get).toHaveBeenCalledWith('/customer/current.jwt', {
                timeout: undefined,
                params: { app_client_id: 'my-client-id' },
                headers: SDK_VERSION_HEADERS,
            });

            expect(requestSender.get).toHaveBeenCalledWith(
                'https://api-b2b.bigcommerce.com/api/v2/store-configs/checkout',
                expect.objectContaining({
                    headers: {
                        'Content-Type': 'application/json',
                        authToken: bcJwt,
                        Authorization: 'Bearer ',
                    },
                }),
            );
        });

        it('forwards the timeout option to both requests', async () => {
            const timeout = { promise: Promise.resolve(), token: { aborted: false } } as never;

            await poConfigRequestSender.getPoConfig(
                'my-client-id',
                'https://api-b2b.bigcommerce.com',
                '',
                { timeout },
            );

            expect(requestSender.get).toHaveBeenCalledWith(
                '/customer/current.jwt',
                expect.objectContaining({ timeout }),
            );
            expect(requestSender.get).toHaveBeenCalledWith(
                'https://api-b2b.bigcommerce.com/api/v2/store-configs/checkout',
                expect.objectContaining({ timeout }),
            );
        });
    });
});
