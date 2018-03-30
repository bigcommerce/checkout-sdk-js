import { RequestSender, Response } from '@bigcommerce/request-sender';

import { RequestOptions } from '../common/http-request';

/**
 * @todo Convert this file into TypeScript properly
 */
export default class CountryRequestSender {
    constructor(
        private _requestSender: RequestSender,
        private _config: { locale?: string }
    ) {}

    loadCountries({ timeout }: RequestOptions = {}): Promise<Response> {
        const url = '/internalapi/v1/store/countries';
        const headers = {
            'Accept-Language': this._config.locale,
        };

        return this._requestSender.get(url, { headers, timeout });
    }
}
