import { RequestSender, Response } from '@bigcommerce/request-sender';

import { RequestOptions } from '../common/http-request';

import { AddOrderExtraFieldsPayload, B2BExtraField } from './b2b-post-order-request-sender';

export interface B2BPaymentsRefreshPayment {
    code: string;
    name: string;
}

export interface CartOrderExtraInfoPayload {
    poNumber?: string;
    referenceNumber?: string;
    extraFields?: B2BExtraField[];
    extraInfo?: AddOrderExtraFieldsPayload['extraInfo'];
}

export default class B2BPreOrderRequestSender {
    constructor(private _requestSender: RequestSender) {}

    async refreshPaymentMethods(
        payments: B2BPaymentsRefreshPayment[],
        b2bToken: string,
        b2bBaseUrl: string,
        options?: RequestOptions,
    ): Promise<Response<unknown>> {
        return this._requestSender.post(`${b2bBaseUrl}/api/v2/payments/refresh`, {
            timeout: options?.timeout,
            credentials: false,
            headers: {
                'Content-Type': 'application/json',
                authToken: b2bToken,
                Authorization: `Bearer ${b2bToken}`,
            },
            body: { payments },
        });
    }

    async submitPreOrderExtraFields(
        cartId: string,
        payload: CartOrderExtraInfoPayload,
        b2bToken: string,
        b2bBaseUrl: string,
        options?: RequestOptions,
    ): Promise<Response<void>> {
        return this._requestSender.put(`${b2bBaseUrl}/api/v3/cart-order/extra-info`, {
            timeout: options?.timeout,
            credentials: false,
            headers: {
                'Content-Type': 'application/json',
                authToken: b2bToken,
                Authorization: `Bearer ${b2bToken}`,
            },
            body: { cartId, ...payload },
        });
    }
}
