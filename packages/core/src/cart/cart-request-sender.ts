import { RequestSender, Response } from '@bigcommerce/request-sender';

import { BuyNowCartRequestBody, Cart } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { ContentType, RequestOptions, SDK_VERSION_HEADERS } from '../common/http-request';

import { HeadlessCartRequestResponse, mapToCart } from './headless-cart';

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

    async loadCart(
        cartId: string,
        host?: string,
        options?: RequestOptions,
    ): Promise<Response<Cart | undefined>> {
        const path = 'cart-information';
        const url = host ? `${host}/${path}` : `/${path}`;

        const requestOptions: RequestOptions = {
            ...options,
            params: {
                cartId,
            },
        };

        return this._requestSender
            .get<HeadlessCartRequestResponse>(url, {
                ...requestOptions,
            })
            .then(this.transformToCartResponse);
    }

    private transformToCartResponse(
        response: Response<HeadlessCartRequestResponse>,
    ): Response<Cart | undefined> {
        const {
            body: {
                data: { site },
            },
        } = response;

        return {
            ...response,
            body: mapToCart(site),
        };
    }
}
