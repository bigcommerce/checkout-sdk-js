import { RequestSender } from '@bigcommerce/request-sender';

import { BraintreeOrderStatusData } from '@bigcommerce/checkout-sdk/braintree-utils';

import {
    ContentType,
    INTERNAL_USE_ONLY,
    RequestOptions,
    SDK_VERSION_HEADERS,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

export default class BraintreeRequestSender {
    constructor(private requestSender: RequestSender) {}

    async getOrderStatus(
        methodId = 'braintreelocalmethods',
        options?: RequestOptions,
    ): Promise<BraintreeOrderStatusData> {
        const url = `/api/storefront/initialization/${methodId}`;
        const headers = {
            'X-API-INTERNAL': INTERNAL_USE_ONLY,
            'Content-Type': ContentType.Json,
            ...SDK_VERSION_HEADERS,
        };

        const res = await this.requestSender.get<BraintreeOrderStatusData>(url, {
            headers,
            ...options,
        });

        return res.body;
    }
}
