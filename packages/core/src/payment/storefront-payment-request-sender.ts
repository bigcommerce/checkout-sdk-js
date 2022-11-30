import { RequestSender } from '@bigcommerce/request-sender';

import { ContentType, INTERNAL_USE_ONLY, SDK_VERSION_HEADERS } from '../common/http-request';

export default class StorefrontPaymentRequestSender {
    constructor(private _requestSender: RequestSender) {}

    async saveExternalId(methodId: string, token: string): Promise<void> {
        const url = `/api/storefront/payment/${methodId}/save-external-id`;
        const options = {
            headers: {
                Accept: ContentType.JsonV1,
                'X-API-INTERNAL': INTERNAL_USE_ONLY,
                ...SDK_VERSION_HEADERS,
            },
            body: {
                externalId: token,
                provider: methodId,
            },
        };

        await this._requestSender.post<void>(url, options);
    }
}
