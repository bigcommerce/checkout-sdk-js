import { RequestSender, Response } from '@bigcommerce/request-sender';

import { ContentType, SDK_VERSION_HEADERS } from '../common/http-request';

const url = '/api/storefront/pickup-options';

export default class PickupOptionRequestSender {
    constructor(
        private _requestSender: RequestSender
    ) {}

    fetchPickupOptions(query: any): Promise<Response<any>> {
        return this._requestSender.post(url, {
            headers: { Accept: ContentType.Json, ...SDK_VERSION_HEADERS },
            body: query,
        });
    }
}
