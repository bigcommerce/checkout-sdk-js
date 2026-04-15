import { RequestSender, Response } from '@bigcommerce/request-sender';

import { RequestOptions, SDK_VERSION_HEADERS } from '../common/http-request';

export interface BCJWTResponseBody {
    token: string;
}

export interface B2BTokenResponseBody {
    code: number;
    data: {
        token: string;
    };
}

export default class B2BTokenRequestSender {
    constructor(private _requestSender: RequestSender) {}

    getBCJWT(appClientId: string, options?: RequestOptions): Promise<Response<BCJWTResponseBody>> {
        return this._requestSender.get('/customer/current.jwt', {
            timeout: options?.timeout,
            params: { app_client_id: appClientId },
            headers: SDK_VERSION_HEADERS,
        });
    }

    fetchB2BToken(
        bcToken: string,
        customerId: number,
        storeHash: string,
        channelId: number,
        b2bBaseUrl: string,
        options?: RequestOptions,
    ): Promise<Response<B2BTokenResponseBody>> {
        return this._requestSender.post(`${b2bBaseUrl}/api/v2/login`, {
            timeout: options?.timeout,
            credentials: false,
            headers: { 'Content-Type': 'application/json' },
            body: {
                bcToken,
                customerId,
                storeHash,
                channelId,
            },
        });
    }
}
