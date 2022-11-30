import { RequestSender, Response } from '@bigcommerce/request-sender';

import { Checkout, CHECKOUT_DEFAULT_INCLUDES } from '../checkout';
import {
    ContentType,
    joinIncludes,
    RequestOptions,
    SDK_VERSION_HEADERS,
} from '../common/http-request';

export default class StoreCreditRequestSender {
    constructor(private _requestSender: RequestSender) {}

    applyStoreCredit(
        checkoutId: string,
        { timeout }: RequestOptions = {},
    ): Promise<Response<Checkout>> {
        const url = `/api/storefront/checkouts/${checkoutId}/store-credit`;
        const headers = {
            Accept: ContentType.JsonV1,
            ...SDK_VERSION_HEADERS,
        };

        return this._requestSender.post(url, {
            headers,
            timeout,
            params: {
                include: joinIncludes(CHECKOUT_DEFAULT_INCLUDES),
            },
        });
    }

    removeStoreCredit(
        checkoutId: string,
        { timeout }: RequestOptions = {},
    ): Promise<Response<Checkout>> {
        const url = `/api/storefront/checkouts/${checkoutId}/store-credit`;
        const headers = {
            Accept: ContentType.JsonV1,
            ...SDK_VERSION_HEADERS,
        };

        return this._requestSender.delete(url, {
            headers,
            timeout,
            params: {
                include: joinIncludes(CHECKOUT_DEFAULT_INCLUDES),
            },
        });
    }
}
