import { RequestSender, Response } from '@bigcommerce/request-sender';

import { BuyNowCartRequestBody, Cart } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { ContentType, RequestOptions, SDK_VERSION_HEADERS } from '../common/http-request';

export default class CartRequestSender {
    constructor(private _requestSender: RequestSender) {}

    createBuyNowCart(
        body: BuyNowCartRequestBody,
        { timeout }: RequestOptions = {},
    ): Promise<Response<Cart>> {
        const url = '/api/storefront/carts';
        const headers = {
            Accept: ContentType.JsonV1,
            ...SDK_VERSION_HEADERS,
        };

        return this._requestSender.post(url, { body, headers, timeout });
    }
}
