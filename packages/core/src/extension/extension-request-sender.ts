import { RequestSender, Response } from '@bigcommerce/request-sender';

import { ContentType, RequestOptions, SDK_VERSION_HEADERS } from '../common/http-request';

import { Extension } from './extension';

export const EXTENSIONS_API_URL = '/api/storefront/checkout-extensions';

export class ExtensionRequestSender {
    constructor(private _requestSender: RequestSender) {}

    loadExtensions({ timeout, params }: RequestOptions = {}): Promise<Response<Extension[]>> {
        return this._requestSender.get(EXTENSIONS_API_URL, {
            timeout,
            headers: {
                Accept: ContentType.JsonV1,
                ...SDK_VERSION_HEADERS,
            },
            params,
        });
    }
}
