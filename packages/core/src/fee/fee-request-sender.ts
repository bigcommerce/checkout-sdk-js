import { RequestSender, Response } from '@bigcommerce/request-sender';

import { Checkout, CHECKOUT_DEFAULT_INCLUDES } from '../checkout';
import {
    ContentType,
    joinIncludes,
    RequestOptions,
    SDK_VERSION_HEADERS,
} from '../common/http-request';

import { FeeRequestBody } from './fee';

// Storefront proxy over the v3 Checkout Fees API.
// Expects BE to expose POST /api/storefront/checkouts/{id}/fees -> /v3/checkouts/{id}/fees.
export default class FeeRequestSender {
    constructor(private _requestSender: RequestSender) {}

    applyFees(
        checkoutId: string,
        fees: FeeRequestBody[],
        { timeout, version }: RequestOptions = {},
    ): Promise<Response<Checkout>> {
        // NOTE: this storefront proxy endpoint is not implemented on BE yet.
        const url = `/api/storefront/checkouts/${checkoutId}/fees`;
        const headers = {
            Accept: ContentType.JsonV1,
            ...SDK_VERSION_HEADERS,
        };

        return this._requestSender.post(url, {
            headers,
            timeout,
            params: {
                // Make sure the returned checkout carries the newly applied fees.
                include: joinIncludes([...CHECKOUT_DEFAULT_INCLUDES, 'fees']),
            },
            // Pass the checkout version for optimistic concurrency, like store credit.
            body: { fees, version },
        });
    }
}
