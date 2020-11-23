import { RequestSender, Response } from '@bigcommerce/request-sender';

import { ContentType, INTERNAL_USE_ONLY, RequestOptions } from '../common/http-request';

import { FormFields } from './form-field';

export default class FormFieldsRequestSender {
    constructor(
        private _requestSender: RequestSender
    ) {}

    loadFields({ timeout }: RequestOptions = {}): Promise<Response<FormFields>> {
        const url = '/api/storefront/form-fields';

        return this._requestSender.get(url, {
            timeout,
            headers: {
                Accept: ContentType.JsonV1,
                'X-API-INTERNAL': INTERNAL_USE_ONLY,
            },
        });
    }
}
