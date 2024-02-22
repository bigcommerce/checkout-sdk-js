import { RequestSender, Response } from '@bigcommerce/request-sender';

import {
    ContentType,
    INTERNAL_USE_ONLY,
    PaymentMethod,
    RequestOptions,
    SDK_VERSION_HEADERS,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

export default class KlarnaV2TokenUpdater {
    constructor(private requestSender: RequestSender) {}

    updateClientToken(
        gatewayId: string,
        { timeout, params }: RequestOptions = {},
    ): Promise<Response<PaymentMethod>> {
        const url = `/api/storefront/payments/${gatewayId}`;

        return this.requestSender.get(url, {
            timeout,
            headers: {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                Accept: ContentType.JsonV1,
                'X-API-INTERNAL': INTERNAL_USE_ONLY,
                ...SDK_VERSION_HEADERS,
            },
            params,
        });
    }
}
