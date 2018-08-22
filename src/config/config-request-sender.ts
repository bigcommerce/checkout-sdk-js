import { RequestSender, Response } from '@bigcommerce/request-sender';

import { ContentType, INTERNAL_USE_ONLY, RequestOptions } from '../common/http-request';

import Config from './config';

export default class ConfigRequestSender {
    constructor(
        private _requestSender: RequestSender
    ) {}

    loadConfig({ timeout }: RequestOptions = {}): Promise<Response<Config>> {
        const url = '/api/storefront/checkout-settings';

        return this._requestSender.get(url, {
            timeout,
            headers: {
                Accept: ContentType.JsonV1,
                'X-API-INTERNAL': INTERNAL_USE_ONLY,
            },
        });
    }
}
