import { RequestSender, Response } from '@bigcommerce/request-sender';

import {
    ContentType,
    INTERNAL_USE_ONLY,
    RequestOptions,
    SDK_VERSION_HEADERS,
} from '../../../common/http-request';
import PaymentMethod from '../../payment-method';

export default class KlarnaV2TokenUpdater {
    constructor(private _requestSender: RequestSender) {}

    updateClientToken(
        gatewayId: string,
        { timeout, params }: RequestOptions = {},
    ): Promise<Response<PaymentMethod>> {
        const url = `/api/storefront/payments/${gatewayId}`;

        return this._requestSender.get(url, {
            timeout,
            headers: {
                Accept: ContentType.JsonV1,
                'X-API-INTERNAL': INTERNAL_USE_ONLY,
                ...SDK_VERSION_HEADERS,
            },
            params,
        });
    }
}
