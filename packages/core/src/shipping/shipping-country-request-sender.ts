import { RequestSender, Response } from '@bigcommerce/request-sender';

import { RequestOptions, SDK_VERSION_HEADERS } from '../common/http-request';
import { CountryResponseBody } from '../geography';

export default class ShippingCountryRequestSender {
    constructor(private _requestSender: RequestSender, private _config: { locale?: string }) {}

    loadCountries({ timeout }: RequestOptions = {}): Promise<Response<CountryResponseBody>> {
        const url = '/internalapi/v1/shipping/countries';
        const headers = {
            'Accept-Language': this._config.locale,
            ...SDK_VERSION_HEADERS,
        };

        return this._requestSender.get(url, { headers, timeout });
    }
}
