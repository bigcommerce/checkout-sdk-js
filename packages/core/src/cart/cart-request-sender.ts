import { RequestSender, Response } from '@bigcommerce/request-sender';

import { ContentType, RequestOptions, SDK_VERSION_HEADERS } from '../common/http-request';
import Cart from './cart';
import BuyNowCartRequestBody from './buy-now-cart-request-body';

export default class CartRequestSender {
    constructor(
        private _requestSender: RequestSender
    ) {}

    createBuyNowCart(body: BuyNowCartRequestBody, { timeout }: RequestOptions = {}): Promise<Response<Cart>> {
        const url = '/api/storefront/carts';
        const headers = {
            Accept: ContentType.JsonV1,
            ...SDK_VERSION_HEADERS,
        };

        return this._requestSender.post(url, { body, headers, timeout });
    }
}
