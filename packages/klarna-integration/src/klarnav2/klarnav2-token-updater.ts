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
                Accept: ContentType.JsonV1,
                'X-API-INTERNAL': INTERNAL_USE_ONLY,
                ...SDK_VERSION_HEADERS,
            },
            params,
        });
    }

    async klarnaOrderInitialization(
        cartId: string,
        clientToken: string | undefined,
    ): Promise<void> {
        const url = `/api/storefront/initialization/klarna`;
        const options = {
            headers: {
                Accept: ContentType.JsonV1,
                'X-API-INTERNAL': INTERNAL_USE_ONLY,
                ...SDK_VERSION_HEADERS,
            },
            body: {
                cartId,
                clientToken,
            },
        };

        await this.requestSender.put(url, options);
    }
}
