import { RequestSender, Response } from '@bigcommerce/request-sender';

import { EmptyCartError } from '../cart/errors';
import { Checkout } from '../checkout';
import { ContentType, RequestOptions, SDK_VERSION_HEADERS } from '../common/http-request';

export default class SpamProtectionRequestSender {
    constructor(private _requestSender: RequestSender) {}

    validate(
        checkoutId: string,
        token: string,
        { timeout }: RequestOptions = {},
    ): Promise<Response<Checkout>> {
        const url = `/api/storefront/checkouts/${checkoutId}/spam-protection`;
        const headers = {
            Accept: ContentType.JsonV1,
            ...SDK_VERSION_HEADERS,
        };

        return this._requestSender
            .post<Checkout>(url, { body: { token }, headers, timeout })
            .catch((err) => {
                if (err.body.type === 'empty_cart') {
                    throw new EmptyCartError();
                }

                throw err;
            });
    }
}
