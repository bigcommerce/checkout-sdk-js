import { RequestSender, Response } from '@bigcommerce/request-sender';

import { RequestOptions, SDK_VERSION_HEADERS } from '../common/http-request';

const B2B_BASE_URL = 'https://api-b2b.bigcommerce.com';

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

    exchangeForB2BToken(
        bcToken: string,
        customerId: number,
        storeHash: string,
        channelId: number,
        options?: RequestOptions,
    ): Promise<Response<B2BTokenResponseBody>> {
        return this._requestSender.post(`${B2B_BASE_URL}/api/v2/login`, {
            timeout: options?.timeout,
            headers: { 'Content-Type': 'application/json' },
            body: {
                bcToken,
                customerId: String(customerId),
                storeHash,
                channelId: String(channelId),
            },
        });
    }
}
