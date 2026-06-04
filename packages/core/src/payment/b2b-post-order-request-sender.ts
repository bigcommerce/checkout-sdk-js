import { RequestSender, Response } from '@bigcommerce/request-sender';

import { RequestOptions } from '../common/http-request';

export interface CloseInvoicePayload {
    orderId: string;
    comment: string;
}

export interface CloseInvoiceResponseBody {
    data: {
        paymentId: string;
        receiptId: string;
    };
    code: number;
}

export default class B2BPostOrderRequestSender {
    constructor(private _requestSender: RequestSender) {}

    async closeInvoice(
        payload: CloseInvoicePayload,
        b2bToken: string,
        b2bBaseUrl: string,
        options?: RequestOptions,
    ): Promise<Response<CloseInvoiceResponseBody>> {
        return this._requestSender.post(
            `${b2bBaseUrl}/api/v1/ip/storefront/payments/bigcommerce/orders`,
            {
                timeout: options?.timeout,
                credentials: false,
                headers: {
                    'Content-Type': 'application/json',
                    authToken: b2bToken,
                    Authorization: `Bearer ${b2bToken}`,
                },
                body: payload,
            },
        );
    }
}
