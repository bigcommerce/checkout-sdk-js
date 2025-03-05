import { RequestSender, Response } from '@bigcommerce/request-sender';

import { BuyNowCartRequestBody, Cart } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { ContentType, RequestOptions, SDK_VERSION_HEADERS } from '../common/http-request';

import { LineItemMap } from './index';

interface LoadCartResponse {
    data: {
        site: {
            cart: {
                amount: {
                    currencyCode: string;
                };
                entityId: string;
                lineItems: {
                    physicalItems: Array<{
                        name: string;
                        entityId: string;
                        quantity: string;
                        productEntityId: string;
                    }>;
                };
            };
        };
    };
}

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

    loadCard(cartId: string, host?: string, options?: RequestOptions): Promise<Response<Cart>> {
        const path = 'cart-information';
        const url = host ? `${host}/${path}` : `/${path}`;

        const requestOptions: RequestOptions = {
            ...options,
            params: {
                cartId,
            },
        };

        return this._requestSender
            .get<LoadCartResponse>(url, {
                ...requestOptions,
            })
            .then(this.transformToCartResponse);
    }

    private transformToCartResponse(response: Response<LoadCartResponse>): Response<Cart> {
        const {
            body: {
                data: {
                    site: {
                        cart: { amount, entityId, lineItems },
                    },
                },
            },
        } = response;

        const mappedLineItems: LineItemMap = {
            // TODO:: add all missing fields
            // eslint-disable-next-line
            // @ts-ignore
            physicalItems: lineItems.physicalItems.map((item) => ({
                id: item.entityId,
                name: item.name,
                quantity: item.quantity,
                productId: item.productEntityId,
            })),
        };

        return {
            ...response,
            body: {
                id: entityId,
                // eslint-disable-next-line
                // @ts-ignore
                currency: {
                    code: amount.currencyCode,
                },
                lineItems: mappedLineItems,
            },
        };
    }
}
