import { RequestSender, Response } from '@bigcommerce/request-sender';

import { RequestOptions } from '../common/http-request';

import { B2BAuthTokens, getB2BAuthHeaders } from './b2b-auth-headers';

export interface B2BPaymentsRefreshPayment {
    code: string;
    name: string;
}

export default class B2BPaymentsRefreshRequestSender {
    constructor(private _requestSender: RequestSender) {}

    async refresh(
        payments: B2BPaymentsRefreshPayment[],
        auth: B2BAuthTokens,
        b2bBaseUrl: string,
        options?: RequestOptions,
    ): Promise<Response<unknown>> {
        return this._requestSender.post(`${b2bBaseUrl}/api/v2/payments/refresh`, {
            timeout: options?.timeout,
            credentials: false,
            headers: {
                'Content-Type': 'application/json',
                ...getB2BAuthHeaders(auth),
            },
            body: { payments },
        });
    }
}
