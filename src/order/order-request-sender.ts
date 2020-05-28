import { RequestSender, Response } from '@bigcommerce/request-sender';
import { isNil, omitBy } from 'lodash';

import { joinIncludes, ContentType, RequestOptions } from '../common/http-request';

import InternalOrderRequestBody from './internal-order-request-body';
import { InternalOrderResponseBody } from './internal-order-responses';
import Order from './order';
import OrderParams from './order-params';

export interface SubmitOrderRequestOptions extends RequestOptions {
    headers?: {
        checkoutVariant?: string;
    };
}

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

    submitOrder(body: InternalOrderRequestBody, { headers, timeout }: SubmitOrderRequestOptions = {}): Promise<Response<InternalOrderResponseBody>> {
        const url = '/internalapi/v1/checkout/order';

        return this._requestSender.post(url, {
            body,
            headers: omitBy({
                'X-Checkout-Variant': headers && headers.checkoutVariant,
                'X-Checkout-SDK-Version': LIBRARY_VERSION,
            }, isNil),
            timeout,
        });
    }

    finalizeOrder(orderId: number, { timeout }: RequestOptions = {}): Promise<Response<InternalOrderResponseBody>> {
        const url = `/internalapi/v1/checkout/order/${orderId}`;

        return this._requestSender.post(url, { timeout });
    }
}
