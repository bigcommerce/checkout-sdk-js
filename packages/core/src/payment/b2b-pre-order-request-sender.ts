import { RequestSender, Response } from '@bigcommerce/request-sender';

import { RequestOptions } from '../common/http-request';

import { B2BOrderMetadataOptions } from './b2b-order-metadata';

interface B2BPaymentsRefreshPayment {
    code: string;
    name: string;
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

    async submitExtraFieldsToCart(
        cartId: string,
        payload: B2BOrderMetadataOptions,
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
