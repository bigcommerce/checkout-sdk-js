import { RequestSender, Response } from '@bigcommerce/request-sender';

import { ContentType, RequestOptions } from '../common/http-request';

import OrderRequestBody from './order-request-body';

import { InternalOrderResponseBody } from './internal-order-responses';
import Order from './order';

const DEFAULT_PARAMS = {
    include: [
        'payments',
        'lineItems.physicalItems.socialMedia',
        'lineItems.digitalItems.socialMedia',
    ].join(','),
};

export default class OrderRequestSender {
    constructor(
        private _requestSender: RequestSender
    ) {}

    loadOrder(orderId: number, { timeout, params }: RequestOptions = {}): Promise<Response<Order>> {
        const url = `/api/storefront/orders/${orderId}`;
        const headers = { Accept: ContentType.JsonV1 };

        return this._requestSender.get(url, {
            params: DEFAULT_PARAMS,
            headers,
            timeout,
        });
    }

    submitOrder(body: OrderRequestBody, { timeout }: RequestOptions = {}): Promise<Response<InternalOrderResponseBody>> {
        const url = '/internalapi/v1/checkout/order';

        return this._requestSender.post(url, { body, timeout });
    }

    finalizeOrder(orderId: number, { timeout }: RequestOptions = {}): Promise<Response<InternalOrderResponseBody>> {
        const url = `/internalapi/v1/checkout/order/${orderId}`;

        return this._requestSender.post(url, { timeout });
    }
}
