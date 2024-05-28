import { RequestSender } from '@bigcommerce/request-sender';

import {
    ContentType,
    INTERNAL_USE_ONLY,
    RequestOptions,
    SDK_VERSION_HEADERS,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import {
    PayPalCreateOrderRequestBody,
    PayPalOrderData,
    PayPalOrderStatusData,
    PayPalUpdateOrderRequestBody,
    PayPalUpdateOrderResponse,
} from './paypal-commerce-types';

export default class PayPalCommerceRequestSender {
    constructor(private requestSender: RequestSender) {}

    async createOrder(
        providerId: string,
        requestBody: Partial<PayPalCreateOrderRequestBody>,
    ): Promise<PayPalOrderData> {
        const url = `/api/storefront/payment/${providerId}`;
        const body = requestBody;
        const headers = {
            'X-API-INTERNAL': INTERNAL_USE_ONLY,
            'Content-Type': ContentType.Json,
            ...SDK_VERSION_HEADERS,
        };

        const res = await this.requestSender.post<PayPalOrderData>(url, { headers, body });

        return res.body;
    }

    async updateOrder(
        requestBody: PayPalUpdateOrderRequestBody,
    ): Promise<PayPalUpdateOrderResponse> {
        const url = `/api/storefront/initialization/paypalcommerce`;
        const body = requestBody;
        const headers = {
            'X-API-INTERNAL': INTERNAL_USE_ONLY,
            'Content-Type': ContentType.Json,
            ...SDK_VERSION_HEADERS,
        };

        const res = await this.requestSender.put<PayPalUpdateOrderResponse>(url, { headers, body });

        return res.body;
    }

    async getOrderStatus(
        methodId = 'paypalcommerce',
        options?: RequestOptions,
    ): Promise<PayPalOrderStatusData> {
        const url = `/api/storefront/initialization/${methodId}`;
        const headers = {
            'X-API-INTERNAL': INTERNAL_USE_ONLY,
            'Content-Type': ContentType.Json,
            ...SDK_VERSION_HEADERS,
        };

        const res = await this.requestSender.get<PayPalOrderStatusData>(url, {
            headers,
            ...options,
        });

        return res.body;
    }
}
