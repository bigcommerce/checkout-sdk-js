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
        const url = '/internalapi/v1/checkout/configuration';

        return this._requestSender.get(url, { timeout });
    }
}
