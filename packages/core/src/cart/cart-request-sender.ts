import { RequestSender, Response } from '@bigcommerce/request-sender';

import { BuyNowCartRequestBody, Cart } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { GQL_REQUEST_URL } from '../common/gql-request';
import { ContentType, RequestOptions, SDK_VERSION_HEADERS } from '../common/http-request';

import {
    GQLCartResponse,
    GQLCurrencyResponse,
    GQLRequestOptions,
    GQLRequestResponse,
} from './gql-cart';
import CartRetrievalError from './gql-cart/errors/cart-retrieval-error';
import getCartCurrencyQuery from './gql-cart/get-cart-currency-query';
import getCartQuery from './gql-cart/get-cart-query';

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

    async loadCart(cartId: string, gqlUrl?: string, options?: RequestOptions) {
        const url = gqlUrl ?? GQL_REQUEST_URL;

        const requestOptions: GQLRequestOptions = {
            ...options,
            body: {
                query: getCartQuery(cartId),
            },
        };

        const response = await this._requestSender.post<GQLRequestResponse<GQLCartResponse>>(url, {
            ...requestOptions,
        });

        if (!response.body.data.site.cart) {
            throw new CartRetrievalError(
                `Could not retrieve cart information by cartId: ${cartId}`,
            );
        }

        return response;
    }

    async loadCartCurrency(currencyCode: string, gqlUrl?: string, options?: RequestOptions) {
        const url = gqlUrl ?? GQL_REQUEST_URL;

        const requestOptions: GQLRequestOptions = {
            ...options,
            body: {
                query: getCartCurrencyQuery(currencyCode),
            },
        };

        const response = await this._requestSender.post<GQLRequestResponse<GQLCurrencyResponse>>(
            url,
            {
                ...requestOptions,
            },
        );

        if (!response.body.data.site.currency) {
            throw new CartRetrievalError(
                `Could not retrieve currency information by currencyCode: ${currencyCode}`,
            );
        }

        return response;
    }
}
