import { RequestSender, Response } from '@bigcommerce/request-sender';

import { RequestOptions } from '../common/http-request';

import InternalOrder from './internal-order';
import OrderRequestBody from './order-request-body';

/**
 * @todo Convert this file into TypeScript properly
 */
export default class OrderRequestSender {
    /**
     * @constructor
     * @param {RequestSender} requestSender
     */
    constructor(
        private _requestSender: RequestSender
    ) {}

    loadOrder(orderId: number, { timeout }: RequestOptions = {}): Promise<Response> {
        const url = `/internalapi/v1/checkout/order/${orderId}`;

        return this._requestSender.get(url, { timeout });
    }

    submitOrder(body: OrderRequestBody, { timeout }: RequestOptions = {}): Promise<Response> {
        const url = '/internalapi/v1/checkout/order';

        return this._requestSender.post(url, { body, timeout });
    }

    finalizeOrder(orderId: number, { timeout }: RequestOptions = {}): Promise<Response> {
        const url = `/internalapi/v1/checkout/order/${orderId}`;

        return this._requestSender.post(url, { timeout });
    }
}
