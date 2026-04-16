import { RequestSender, Response } from '@bigcommerce/request-sender';

import { RequestOptions, SDK_VERSION_HEADERS } from '../common/http-request';

export interface B2BTokenResponseBody {
    code: number;
    data: {
        token: string;
    };
}

export default class B2BTokenRequestSender {
    constructor(private _requestSender: RequestSender) {}

    async getB2BToken(
        appClientId: string,
        customerId: number,
        storeHash: string,
        channelId: number,
        b2bBaseUrl: string,
        options?: RequestOptions,
    ): Promise<Response<B2BTokenResponseBody>> {
        const { body: jwtBody } = await this._requestSender.get<{ token: string }>(
            '/customer/current.jwt',
            {
                timeout: options?.timeout,
                params: { app_client_id: appClientId },
                headers: SDK_VERSION_HEADERS,
            },
        );

        return this._requestSender.post(`${b2bBaseUrl}/api/v2/login`, {
            timeout: options?.timeout,
            credentials: false,
            headers: { 'Content-Type': 'application/json' },
            body: {
                bcToken: jwtBody.token,
                customerId,
                storeHash,
                channelId,
            },
        });
    }
}
