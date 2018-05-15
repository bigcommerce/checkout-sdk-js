import { RequestSender, Response } from '@bigcommerce/request-sender';

import { RequestOptions } from '../common/http-request';

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
                'X-API-INTERNAL': 'This API endpoint is for internal use only and may change in the future',
            },
        });
    }
}
