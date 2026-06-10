import { createRequestSender, createTimeout, RequestSender } from '@bigcommerce/request-sender';

import { getErrorResponse, getResponse } from '../common/http-request/responses.mock';

import B2BPostOrderRequestSender, {
    AddOrderExtraFieldsPayload,
    CloseInvoicePayload,
} from './b2b-post-order-request-sender';

describe('B2BPostOrderRequestSender', () => {
    let requestSender: RequestSender;
    let b2bPostOrderRequestSender: B2BPostOrderRequestSender;

    const payload: CloseInvoicePayload = {
        orderId: '295',
        comment: 'Invoice comment',
    };

    beforeEach(() => {
        requestSender = createRequestSender();

        jest.spyOn(requestSender, 'post').mockResolvedValue(
            getResponse({ paymentId: 'pay_1', receiptId: 'rcpt_1' }),
        );

        b2bPostOrderRequestSender = new B2BPostOrderRequestSender(requestSender);
    });

    describe('#persistMetadata()', () => {
        it('posts to the IP orders endpoint with auth headers and payload', async () => {
            await b2bPostOrderRequestSender.submitInvoice(
                payload,
                'b2b-token-value',
                'https://api-b2b.bigcommerce.com',
            );

            expect(requestSender.post).toHaveBeenCalledWith(
                'https://api-b2b.bigcommerce.com/api/v1/ip/storefront/payments/bigcommerce/orders',
                {
                    timeout: undefined,
                    credentials: false,
                    headers: {
                        'Content-Type': 'application/json',
                        authToken: 'b2b-token-value',
                        Authorization: 'Bearer b2b-token-value',
                    },
                    body: payload,
                },
            );
        });

        it('forwards the request timeout', async () => {
            const timeout = createTimeout();

            await b2bPostOrderRequestSender.submitInvoice(
                payload,
                'b2b-token-value',
                'https://api-b2b.bigcommerce.com',
                { timeout },
            );

            expect(requestSender.post).toHaveBeenCalledWith(
                'https://api-b2b.bigcommerce.com/api/v1/ip/storefront/payments/bigcommerce/orders',
                expect.objectContaining({ timeout }),
            );
        });

        it('rejects when the request sender rejects', async () => {
            jest.spyOn(requestSender, 'post').mockRejectedValue(getErrorResponse());

            await expect(
                b2bPostOrderRequestSender.submitInvoice(
                    payload,
                    'b2b-token-value',
                    'https://api-b2b.bigcommerce.com',
                ),
            ).rejects.toEqual(getErrorResponse());
        });
    });

    describe('#addOrderExtraFields()', () => {
        const extraFieldsPayload: AddOrderExtraFieldsPayload = {
            orderId: '295',
            poNumber: 'PO-123',
            referenceNumber: 'REF-456',
            extraFields: [{ fieldName: 'department', fieldValue: 'engineering' }],
            extraInfo: {
                billingAddressId: 12,
                shipppingAddressId: 34,
                addressExtraFields: {
                    billingAddressExtraFields: [{ fieldName: 'floor', fieldValue: 3 }],
                    shippingAddressExtraFields: [{ fieldName: 'gate', fieldValue: 'B' }],
                },
            },
        };

        it('posts to the B2B orders endpoint with auth headers and payload', async () => {
            await b2bPostOrderRequestSender.addOrderExtraFields(
                extraFieldsPayload,
                'b2b-token-value',
                'https://api-b2b.bigcommerce.com',
            );

            expect(requestSender.post).toHaveBeenCalledWith(
                'https://api-b2b.bigcommerce.com/api/v2/orders',
                {
                    credentials: false,
                    headers: {
                        'Content-Type': 'application/json',
                        authToken: 'b2b-token-value',
                        Authorization: 'Bearer b2b-token-value',
                    },
                    body: extraFieldsPayload,
                },
            );
        });

        it('rejects when the request sender rejects', async () => {
            jest.spyOn(requestSender, 'post').mockRejectedValue(getErrorResponse());

            await expect(
                b2bPostOrderRequestSender.addOrderExtraFields(
                    extraFieldsPayload,
                    'b2b-token-value',
                    'https://api-b2b.bigcommerce.com',
                ),
            ).rejects.toEqual(getErrorResponse());
        });
    });
});
