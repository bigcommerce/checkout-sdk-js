import { RequestSender, Response } from '@bigcommerce/request-sender';

import { ContentType, SDK_VERSION_HEADERS } from '../common/http-request';

import { PickupOptionAPIRequestBody, PickupOptionResponse } from './pickup-option';

const url = '/api/storefront/pickup-options';

export default class PickupOptionRequestSender {
    constructor(private _requestSender: RequestSender) {}

    fetchPickupOptions(query: PickupOptionAPIRequestBody): Promise<Response<PickupOptionResponse>> {
        return this._requestSender.post(url, {
            headers: { Accept: ContentType.Json, ...SDK_VERSION_HEADERS },
            body: query,
        });
    }
}
