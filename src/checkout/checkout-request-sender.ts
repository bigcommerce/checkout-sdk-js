import { RequestSender, Response } from '@bigcommerce/request-sender';

import { ContentType, RequestOptions } from '../common/http-request';

import Checkout, { CheckoutRequestBody } from './checkout';
import CHECKOUT_DEFAULT_INCLUDES from './checkout-default-includes';
import CheckoutParams from './checkout-params';

export default class CheckoutRequestSender {
    constructor(
        private _requestSender: RequestSender
    ) {}

    loadCheckout(id: string, { params, timeout }: RequestOptions<CheckoutParams> = {}): Promise<Response<Checkout>> {
        const url = `/api/storefront/checkout/${id}`;
        const headers = { Accept: ContentType.JsonV1 };

        return this._requestSender.get(url, {
            params: {
                include: CHECKOUT_DEFAULT_INCLUDES.concat(params && params.include || []).join(','),
            },
            headers,
            timeout,
        });
    }

    updateCheckout(id: string, body: CheckoutRequestBody, { params, timeout }: RequestOptions<CheckoutParams> = {}): Promise<Response<Checkout>> {
        const url = `/api/storefront/checkout/${id}`;
        const headers = { Accept: ContentType.JsonV1 };

        return this._requestSender.put(url, {
            params: {
                include: CHECKOUT_DEFAULT_INCLUDES.concat(params && params.include || []).join(','),
            },
            body,
            headers,
            timeout,
        });
    }
}
