import { RequestSender, Response } from '@bigcommerce/request-sender';

import { RequestOptions, SDK_VERSION_HEADERS } from '../common/http-request';

export interface PoConfigStoreSetting {
    id?: number;
    value: string;
    type?: string;
}

export interface PoConfigResponseData {
    checkoutPaymentPurchaseEnableExtra: PoConfigStoreSetting;
    checkoutPaymentPurchaseExtraFields: PoConfigStoreSetting;
    checkoutPaymentPurchaseExtraFieldsRequired: PoConfigStoreSetting;
    [key: string]: PoConfigStoreSetting | string | undefined;
}

export interface PoConfigResponseBody {
    code: number;
    message: string;
    data: PoConfigResponseData;
}

export default class PoConfigRequestSender {
    constructor(private _requestSender: RequestSender) {}

    async getPoConfig(
        appClientId: string,
        b2bBaseUrl: string,
        b2bToken: string,
        options?: RequestOptions,
    ): Promise<Response<PoConfigResponseBody>> {
        let bcToken = '';

        if (!b2bToken) {
            const { body } = await this._requestSender.get<{ token: string }>(
                '/customer/current.jwt',
                {
                    timeout: options?.timeout,
                    params: { app_client_id: appClientId },
                    headers: SDK_VERSION_HEADERS,
                },
            );

            bcToken = body.token;
        }

        return this._requestSender.get(`${b2bBaseUrl}/api/v2/store-configs/checkout`, {
            timeout: options?.timeout,
            credentials: false,
            headers: {
                'Content-Type': 'application/json',
                authToken: b2bToken || bcToken,
                Authorization: `Bearer ${b2bToken}`,
            },
        });
    }
}
