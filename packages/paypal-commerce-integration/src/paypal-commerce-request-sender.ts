import { RequestSender } from '@bigcommerce/request-sender';

import {
    ContentType,
    INTERNAL_USE_ONLY,
    SDK_VERSION_HEADERS,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import {
    PayPalCreateOrderRequestBody,
    PayPalOrderData,
    PayPalUpdateOrderRequestBody,
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

    async updateOrder(requestBody: PayPalUpdateOrderRequestBody) {
        const url = `/api/storefront/initialization/paypalcommerce`;
        const body = requestBody;
        const headers = {
            'X-API-INTERNAL': INTERNAL_USE_ONLY,
            'Content-Type': ContentType.Json,
            ...SDK_VERSION_HEADERS,
        };

        const res = await this.requestSender.put(url, { headers, body });

        return res.body;
    }
}
