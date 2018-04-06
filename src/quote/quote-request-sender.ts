import { RequestSender, Response } from '@bigcommerce/request-sender';

import { RequestOptions } from '../common/http-request';

/**
 * @todo Convert this file into TypeScript properly
 */
export default class QuoteRequestSender {
    constructor(
        private _requestSender: RequestSender
    ) {}

    loadQuote({ timeout }: RequestOptions = {}): Promise<Response> {
        const url = '/internalapi/v1/checkout/quote';
        const params = {
            includes: ['cart', 'customer', 'shippingOptions', 'order'].join(','),
        };

        return this._requestSender.get(url, { params, timeout });
    }
}
