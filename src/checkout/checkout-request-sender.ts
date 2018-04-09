import { RequestSender, Response } from '@bigcommerce/request-sender';

import { RequestOptions } from '../common/http-request';

/**
 * @todo Convert this file into TypeScript properly
 * i.e.: Response<T>
 */
export default class CheckoutRequestSender {
    constructor(
        private _requestSender: RequestSender
    ) {}

    loadCheckout(id: string, { timeout }: RequestOptions = {}): Promise<Response> {
        const url = `/api/storefront/checkout/${id}`;

        return this._requestSender.get(url, { timeout });
    }
}
