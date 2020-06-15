import { RequestSender, Response } from '@bigcommerce/request-sender';

import { joinOrMergeIncludes, ContentType, RequestOptions } from '../common/http-request';

import Checkout, { CheckoutRequestBody } from './checkout';
import CHECKOUT_DEFAULT_INCLUDES from './checkout-default-includes';
import CheckoutParams from './checkout-params';
import { CheckoutNotAvailableError } from './errors';

export default class CheckoutRequestSender {
    constructor(
        private _requestSender: RequestSender
    ) {}

    loadCheckout(id: string, { params: { include } = {}, timeout }: RequestOptions<CheckoutParams> = {}): Promise<Response<Checkout>> {
        const url = `/api/storefront/checkout/${id}`;
        const headers = { Accept: ContentType.JsonV1 };

        return this._requestSender.get<Checkout>(url, {
            params: {
                include: joinOrMergeIncludes(CHECKOUT_DEFAULT_INCLUDES, include),
            },
            headers,
            timeout,
        }).catch(error => {
            if (error.status >= 400 && error.status < 500) {
                throw new CheckoutNotAvailableError(error);
            }

            throw error;
        });
    }

    updateCheckout(id: string, body: CheckoutRequestBody, { params: { include } = {}, timeout }: RequestOptions<CheckoutParams> = {}): Promise<Response<Checkout>> {
        const url = `/api/storefront/checkout/${id}`;
        const headers = { Accept: ContentType.JsonV1 };

        return this._requestSender.put(url, {
            params: {
                include: joinOrMergeIncludes(CHECKOUT_DEFAULT_INCLUDES, include),
            },
            body,
            headers,
            timeout,
        });
    }
}
