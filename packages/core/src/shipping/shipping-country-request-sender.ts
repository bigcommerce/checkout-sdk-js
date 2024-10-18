import { RequestSender, Response } from '@bigcommerce/request-sender';

import { RequestOptions, SDK_VERSION_HEADERS } from '../common/http-request';
import { CountryResponseBody } from '../geography';

export default class ShippingCountryRequestSender {
    constructor(private _requestSender: RequestSender, private _config: { locale?: string }) {}

    loadCountries(
        channelId: number | null,
        { timeout }: RequestOptions = {},
    ): Promise<Response<CountryResponseBody>> {
        const channelIdParam = channelId ? `?channel_id=${channelId}` : '';
        const url = `/internalapi/v1/shipping/countries${channelIdParam}`;

        const headers = {
            'Accept-Language': this._config.locale,
            ...SDK_VERSION_HEADERS,
        };

        return this._requestSender.get(url, { headers, timeout });
    }
}
