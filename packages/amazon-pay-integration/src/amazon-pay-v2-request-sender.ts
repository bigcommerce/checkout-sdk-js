import { RequestSender, Response } from '@bigcommerce/request-sender';

import {
    ContentType,
    INTERNAL_USE_ONLY,
    SDK_VERSION_HEADERS,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

export interface CheckoutConfig {
    payload: string;
    signature: string;
    public_key: string;
}

export default class AmazonPayV2RequestSender {
    constructor(private _requestSender: RequestSender) {}

    createCheckoutConfig(cartId: string | number): Promise<Response<CheckoutConfig>> {
        const body = { cartId };
        const headers = {
            'X-API-INTERNAL': INTERNAL_USE_ONLY,
            'Content-Type': ContentType.Json,
            ...SDK_VERSION_HEADERS,
        };

        return this._requestSender.post('/api/storefront/payment/amazonpay', { headers, body });
    }
}
