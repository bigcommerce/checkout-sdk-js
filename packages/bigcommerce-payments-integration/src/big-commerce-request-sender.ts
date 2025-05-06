import { RequestSender } from '@bigcommerce/request-sender';

import {
    ContentType,
    INTERNAL_USE_ONLY,
    RequestOptions,
    SDK_VERSION_HEADERS,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import {
    BigCommerceCreateOrderRequestBody,
    BigCommerceOrderData,
    BigCommerceOrderStatusData,
    BigCommerceUpdateOrderRequestBody,
    BigCommerceUpdateOrderResponse,
} from './big-commerce-types';

export default class BigCommerceRequestSender {
    constructor(private requestSender: RequestSender) {}

    async createOrder(
        providerId: string,
        requestBody: Partial<BigCommerceCreateOrderRequestBody>,
    ): Promise<BigCommerceOrderData> {
        const url = `/api/storefront/payment/${providerId}`;
        const body = requestBody;
        const headers = {
            'X-API-INTERNAL': INTERNAL_USE_ONLY,
            'Content-Type': ContentType.Json,
            ...SDK_VERSION_HEADERS,
        };

        const res = await this.requestSender.post<BigCommerceOrderData>(url, { headers, body });

        return res.body;
    }

    async updateOrder(
        requestBody: BigCommerceUpdateOrderRequestBody,
    ): Promise<BigCommerceUpdateOrderResponse> {
        const url = `/api/storefront/initialization/bigcommerce`;
        const body = requestBody;
        const headers = {
            'X-API-INTERNAL': INTERNAL_USE_ONLY,
            'Content-Type': ContentType.Json,
            ...SDK_VERSION_HEADERS,
        };

        const res = await this.requestSender.put<BigCommerceUpdateOrderResponse>(url, {
            headers,
            body,
        });

        return res.body;
    }

    async getOrderStatus(
        methodId = 'bigcommerce',
        options?: RequestOptions,
    ): Promise<BigCommerceOrderStatusData> {
        const url = `/api/storefront/initialization/${methodId}`;
        const headers = {
            'X-API-INTERNAL': INTERNAL_USE_ONLY,
            'Content-Type': ContentType.Json,
            ...SDK_VERSION_HEADERS,
        };

        const res = await this.requestSender.get<BigCommerceOrderStatusData>(url, {
            headers,
            ...options,
        });

        return res.body;
    }
}
