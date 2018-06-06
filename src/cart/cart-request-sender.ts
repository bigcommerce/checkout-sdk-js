import { RequestSender, Response } from '@bigcommerce/request-sender';

import { RequestOptions } from '../common/http-request';

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
}
