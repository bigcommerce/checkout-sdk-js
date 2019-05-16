import { RequestSender, Response } from '@bigcommerce/request-sender';

import { joinIncludes, ContentType, RequestOptions } from '../common/http-request';

import InternalOrderRequestBody from './internal-order-request-body';
import { InternalOrderResponseBody } from './internal-order-responses';
import Order from './order';
import OrderParams from './order-params';

export default class OrderRequestSender {
    constructor(
        private _requestSender: RequestSender
    ) {}

    loadOrder(orderId: number, { timeout, params }: RequestOptions<OrderParams> = {}): Promise<Response<Order>> {
        const url = `/api/storefront/orders/${orderId}`;
        const headers = { Accept: ContentType.JsonV1 };
        const include = [
            'payments',
            'lineItems.physicalItems.socialMedia',
            'lineItems.physicalItems.options',
            'lineItems.digitalItems.socialMedia',
            'lineItems.digitalItems.options',
        ];

        return this._requestSender.get(url, {
            params: {
                include: joinIncludes([
                    ...include,
                    ...(params && params.include || []),
                ]),
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
