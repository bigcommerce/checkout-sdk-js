import { RequestSender, Response } from '@bigcommerce/request-sender';

import { BuyNowCartRequestBody, Cart } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { ContentType, RequestOptions, SDK_VERSION_HEADERS } from '../common/http-request';

import { GQLCartRequestResponse, mapToCart } from './gql-cart';

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

    async loadCart(cartId: string, options?: RequestOptions): Promise<Response<Cart | undefined>> {
        const path = `${window.location.origin}/api/wallet-buttons/cart-information`;

        const requestOptions: RequestOptions = {
            ...options,
            params: {
                cartId,
            },
        };

        const response = await this._requestSender.get<GQLCartRequestResponse>(path, {
            ...requestOptions,
        });

        return this.transformToCartResponse(response);
    }

    private transformToCartResponse(
        response: Response<GQLCartRequestResponse>,
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
