import { RequestSender, Response } from '@bigcommerce/request-sender';

import { RequestOptions } from '../common/http-request';

/**
 * @todo Convert this file into TypeScript properly
 */
export default class ConfigRequestSender {
    constructor(
        private _requestSender: RequestSender
    ) {}

    loadConfig({ timeout }: RequestOptions = {}): Promise<Response> {
        const url = '/api/storefront/checkoutsettings';

        return this._requestSender.get(url, {
            timeout,
            headers: {
                'X-API-INTERNAL': 'This API endpoint is for internal use only and changes',
            },
        });
    }
}
