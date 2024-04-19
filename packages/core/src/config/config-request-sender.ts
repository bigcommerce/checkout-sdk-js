import { RequestSender, Response } from '@bigcommerce/request-sender';

import { CheckoutNotAvailableError } from '../checkout/errors';
import {
    ContentType,
    INTERNAL_USE_ONLY,
    RequestOptions,
    SDK_VERSION_HEADERS,
} from '../common/http-request';

import Config from './config';

export default class ConfigRequestSender {
    constructor(private _requestSender: RequestSender) {}

    loadConfig({ timeout, params }: RequestOptions = {}): Promise<Response<Config>> {
        const url = '/api/storefront/checkout-settings';

        return this._requestSender
            .get<Config>(url, {
                timeout,
                headers: {
                    Accept: ContentType.JsonV1,
                    'X-API-INTERNAL': INTERNAL_USE_ONLY,
                    ...SDK_VERSION_HEADERS,
                },
                params,
            })
            .catch((error) => {
                if (error.status >= 400 && error.status < 500) {
                    throw new CheckoutNotAvailableError(error);
                }

                throw error;
            });
    }
}
