import { createRequestSender, createTimeout, RequestSender } from '@bigcommerce/request-sender';

import { getErrorResponse, getResponse } from '../common/http-request/responses.mock';

import B2BPaymentsRefreshRequestSender from './b2b-payments-refresh-request-sender';

describe('B2BPaymentsRefreshRequestSender', () => {
    let requestSender: RequestSender;
    let b2bPaymentsRefreshRequestSender: B2BPaymentsRefreshRequestSender;

    const payments = [
        { code: 'cheque', name: 'Check' },
        { code: 'stripev3', name: 'Stripe' },
    ];

    beforeEach(() => {
        requestSender = createRequestSender();

        jest.spyOn(requestSender, 'post').mockResolvedValue(getResponse({}));

        b2bPaymentsRefreshRequestSender = new B2BPaymentsRefreshRequestSender(requestSender);
    });

    describe('#refresh()', () => {
        it('posts to the payments refresh endpoint with auth headers and payload', async () => {
            await b2bPaymentsRefreshRequestSender.refresh(
                payments,
                'b2b-token-value',
                'https://api-b2b.bigcommerce.com',
            );

            expect(requestSender.post).toHaveBeenCalledWith(
                'https://api-b2b.bigcommerce.com/api/v2/payments/refresh',
                {
                    timeout: undefined,
                    credentials: false,
                    headers: {
                        'Content-Type': 'application/json',
                        authToken: 'b2b-token-value',
                        Authorization: 'Bearer b2b-token-value',
                    },
                    body: { payments },
                },
            );
        });

        it('forwards the request timeout', async () => {
            const timeout = createTimeout();

            await b2bPaymentsRefreshRequestSender.refresh(
                payments,
                'b2b-token-value',
                'https://api-b2b.bigcommerce.com',
                { timeout },
            );

            expect(requestSender.post).toHaveBeenCalledWith(
                'https://api-b2b.bigcommerce.com/api/v2/payments/refresh',
                expect.objectContaining({ timeout }),
            );
        });

        it('uses the provided b2bBaseUrl for the endpoint', async () => {
            await b2bPaymentsRefreshRequestSender.refresh(
                payments,
                'b2b-token-value',
                'https://api-b2b.staging.zone',
            );

            expect(requestSender.post).toHaveBeenCalledWith(
                'https://api-b2b.staging.zone/api/v2/payments/refresh',
                expect.any(Object),
            );
        });

        it('sends an empty payments array when given one', async () => {
            await b2bPaymentsRefreshRequestSender.refresh(
                [],
                'b2b-token-value',
                'https://api-b2b.bigcommerce.com',
            );

            expect(requestSender.post).toHaveBeenCalledWith(
                'https://api-b2b.bigcommerce.com/api/v2/payments/refresh',
                expect.objectContaining({ body: { payments: [] } }),
            );
        });

        it('rejects when the request sender rejects', async () => {
            jest.spyOn(requestSender, 'post').mockRejectedValue(getErrorResponse());

            await expect(
                b2bPaymentsRefreshRequestSender.refresh(
                    payments,
                    'b2b-token-value',
                    'https://api-b2b.bigcommerce.com',
                ),
            ).rejects.toEqual(getErrorResponse());
        });
    });
});
