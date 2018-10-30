import { RequestSender, Response } from '@bigcommerce/request-sender';

import { ContentType, RequestOptions } from '../common/http-request';

import InternalOrderRequestBody from './internal-order-request-body';
import { InternalOrderResponseBody } from './internal-order-responses';
import Order from './order';
import OrderDefaultIncludes from './order-default-includes';
import OrderParams from './order-params';

export default class OrderRequestSender {
    constructor(
        private _requestSender: RequestSender
    ) {}

    loadOrder(orderId: number, { params, timeout }: RequestOptions<OrderParams> = {}): Promise<Response<Order>> {
        const url = `/api/storefront/orders/${orderId}`;
        const headers = { Accept: ContentType.JsonV1 };

        return this._requestSender.get(url, {
            params: {
                include: OrderDefaultIncludes.concat(params && params.include || []).join(','),
            },
            headers,
            timeout,
        });
    }

    submitOrder(body: InternalOrderRequestBody, { timeout }: RequestOptions = {}): Promise<Response<InternalOrderResponseBody>> {
        const url = '/internalapi/v1/checkout/order';

        return this._requestSender.post(url, { body, timeout });
    }

    finalizeOrder(orderId: number, { timeout }: RequestOptions = {}): Promise<Response<InternalOrderResponseBody>> {
        const url = `/internalapi/v1/checkout/order/${orderId}`;

        return this._requestSender.post(url, { timeout });
    }
}
