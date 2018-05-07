import { RequestSender, Response } from '@bigcommerce/request-sender';

import { ContentType, RequestOptions } from '../common/http-request';

/**
 * @todo Convert this file into TypeScript properly
 */
export default class ConfigRequestSender {
    constructor(
        private _requestSender: RequestSender
    ) {}

    loadConfig({ timeout }: RequestOptions = {}): Promise<Response> {
        const url = '/api/storefront/checkout-settings';

        return this._requestSender.get(url, {
            timeout,
            headers: {
                Accept: ContentType.JsonV1,
                'X-API-INTERNAL': 'This API endpoint is for internal use only and may change in the future',
            },
        });
    }
}
