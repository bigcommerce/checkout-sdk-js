import { createRequestSender, createTimeout, RequestSender } from '@bigcommerce/request-sender';

import { getErrorResponse, getResponse } from '../common/http-request/responses.mock';

import B2BPreOrderRequestSender from './b2b-pre-order-request-sender';

describe('B2BPreOrderRequestSender', () => {
    let requestSender: RequestSender;
    let b2bPreOrderRequestSender: B2BPreOrderRequestSender;

    const payments = [
        { code: 'cheque', name: 'Check' },
        { code: 'stripev3', name: 'Stripe' },
    ];

    beforeEach(() => {
        requestSender = createRequestSender();

        jest.spyOn(requestSender, 'post').mockResolvedValue(getResponse({}));
        jest.spyOn(requestSender, 'put').mockResolvedValue(getResponse({}));

        b2bPreOrderRequestSender = new B2BPreOrderRequestSender(requestSender);
    });

    describe('#refreshPaymentMethods()', () => {
        it('posts to the payments refresh endpoint with auth headers and payload', async () => {
            await b2bPreOrderRequestSender.refreshPaymentMethods(
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

            await b2bPreOrderRequestSender.refreshPaymentMethods(
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

        it('rejects when the request sender rejects', async () => {
            jest.spyOn(requestSender, 'post').mockRejectedValue(getErrorResponse());

            await expect(
                b2bPreOrderRequestSender.refreshPaymentMethods(
                    payments,
                    'b2b-token-value',
                    'https://api-b2b.bigcommerce.com',
                ),
            ).rejects.toEqual(getErrorResponse());
        });
    });

    describe('#submitPreOrderExtraFields()', () => {
        it('puts to the cart-order extra-info endpoint with auth headers and cartId in the body', async () => {
            await b2bPreOrderRequestSender.submitPreOrderExtraFields(
                'cart-123',
                { poNumber: 'PO-1', referenceNumber: 'REF-1' },
                'b2b-token-value',
                'https://api-b2b.bigcommerce.com',
            );

            expect(requestSender.put).toHaveBeenCalledWith(
                'https://api-b2b.bigcommerce.com/api/v3/cart-order/extra-info',
                {
                    timeout: undefined,
                    credentials: false,
                    headers: {
                        'Content-Type': 'application/json',
                        authToken: 'b2b-token-value',
                        Authorization: 'Bearer b2b-token-value',
                    },
                    body: { cartId: 'cart-123', poNumber: 'PO-1', referenceNumber: 'REF-1' },
                },
            );
        });

        it('forwards the request timeout', async () => {
            const timeout = createTimeout();

            await b2bPreOrderRequestSender.submitPreOrderExtraFields(
                'cart-123',
                {},
                'b2b-token-value',
                'https://api-b2b.bigcommerce.com',
                { timeout },
            );

            expect(requestSender.put).toHaveBeenCalledWith(
                'https://api-b2b.bigcommerce.com/api/v3/cart-order/extra-info',
                expect.objectContaining({ timeout }),
            );
        });

        it('rejects when the request sender rejects', async () => {
            jest.spyOn(requestSender, 'put').mockRejectedValue(getErrorResponse());

            await expect(
                b2bPreOrderRequestSender.submitPreOrderExtraFields(
                    'cart-123',
                    {},
                    'b2b-token-value',
                    'https://api-b2b.bigcommerce.com',
                ),
            ).rejects.toEqual(getErrorResponse());
        });
    });
});
