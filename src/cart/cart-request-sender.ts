import { RequestSender, Response } from '@bigcommerce/request-sender';

import { ContentType, RequestOptions } from '../common/http-request';

/**
 * @todo Convert this file into TypeScript properly
 */
export default class CartRequestSender {
    constructor(
        private _requestSender: RequestSender
    ) {}

    loadCart({ timeout }: RequestOptions = {}): Promise<Response> {
        const url = '/internalapi/v1/checkout/cart';

        return this._requestSender.get(url, { timeout });
    }

    loadCarts({ timeout }: RequestOptions = {}): Promise<Response> {
        const url = '/api/storefront/carts';
        const headers = { Accept: ContentType.JsonV1 };

        return this._requestSender.get(url, { headers, timeout });
    }
}
