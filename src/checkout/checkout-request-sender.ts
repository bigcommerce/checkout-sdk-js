import { RequestSender, Response } from '@bigcommerce/request-sender';

import { ContentType, RequestOptions } from '../common/http-request';

import Checkout from './checkout';
import CheckoutParams from './checkout-params';

export default class CheckoutRequestSender {
    constructor(
        private _requestSender: RequestSender
    ) {}

    loadCheckout(id: string, { params, timeout }: RequestOptions<CheckoutParams> = {}): Promise<Response<Checkout>> {
        const url = `/api/storefront/checkout/${id}`;
        const headers = { Accept: ContentType.JsonV1 };
        const defaultIncludes = [
            'cart.lineItems.physicalItems.options',
            'cart.lineItems.digitalItems.options',
            'customer',
            'payments',
            'promotions.banners',
        ];

        return this._requestSender.get(url, {
            params: {
                include: defaultIncludes.concat(params && params.include || []).join(','),
            },
            headers,
            timeout,
        });
    }
}
