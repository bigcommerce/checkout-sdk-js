import { RequestSender, Response } from '@bigcommerce/request-sender';

import { ContentType, RequestOptions, SDK_VERSION_HEADERS } from '../common/http-request';
import Cart from './cart';
import CartRequestBody from './cart-request-body';

export default class CartRequestSender {
    constructor(
        private _requestSender: RequestSender
    ) {}

    createCart(body: CartRequestBody, { timeout }: RequestOptions = {}): Promise<Response<Cart>> {
        const url = '/api/storefront/carts';
        const headers = {
            Accept: ContentType.JsonV1,
            ...SDK_VERSION_HEADERS,
        };

        return this._requestSender.post(url, { body, headers, timeout });
    }
}
