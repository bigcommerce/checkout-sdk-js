import { RequestSender, Response } from '@bigcommerce/request-sender';

import { transformParams, ContentType, RequestOptions } from '../common/http-request';

import OrderParams from './order-params';
import OrderRequestBody from './order-request-body';

import { InternalOrderResponseBody } from './internal-order-responses';
import Order from './order';

export default class OrderRequestSender {
    constructor(
        private _requestSender: RequestSender
    ) {}

    loadOrder(orderId: number, { timeout, params }: RequestOptions<OrderParams> = {}): Promise<Response<Order>> {
        const url = `/api/storefront/orders/${orderId}`;
        const headers = { Accept: ContentType.JsonV1 };

        return this._requestSender.get(url, {
            params: transformParams(params),
            headers,
            timeout,
        });
    }

    loadInternalOrder(orderId: number, { timeout }: RequestOptions = {}): Promise<Response<InternalOrderResponseBody>> {
        const url = `/internalapi/v1/checkout/order/${orderId}`;

        return this._requestSender.get(url, { timeout });
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
