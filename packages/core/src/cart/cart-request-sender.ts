import { RequestSender, Response } from '@bigcommerce/request-sender';

import { BuyNowCartRequestBody, Cart } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { ContentType, RequestOptions, SDK_VERSION_HEADERS } from '../common/http-request';

import { LineItemMap } from './index';

interface LoadCartRequestOptions extends RequestOptions {
    body?: { query: string };
    headers: { Authorization: string; [key: string]: string };
}

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

    loadCard(cartId: string, options: LoadCartRequestOptions): Promise<Response<Cart>> {
        const url = `/graphql`;

        const graphQLQuery = `
        query {
            site {
                cart(entityId: "${cartId}") {
                  currencyCode
                  entityId
                  id
                  isTaxIncluded
                  discounts {
                    entityId
                    discountedAmount {
                      currencyCode
                      value
                    }
                  }
                  discountedAmount {
                    currencyCode
                    value
                  }
                  baseAmount {
                    currencyCode
                    value
                  }
                  amount {
                    currencyCode
                    value
                  }
                  lineItems {
                    physicalItems {
                      brand
                      couponAmount {
                        value
                      }
                      discountedAmount {
                        value
                      }
                      discounts {
                        discountedAmount {
                          value
                        }
                        entityId
                      }
                      extendedListPrice {
                        value
                      }
                      extendedSalePrice {
                        value
                      }
                      giftWrapping {
                        amount {
                          value
                        }
                        message
                        name
                      }
                      isShippingRequired
                      isTaxable
                      listPrice {
                        value
                      }
                      name
                      originalPrice {
                        value
                      }
                      entityId
                      quantity
                      salePrice {
                        value
                      }
                      sku
                      url
                    }
                  }
                }
              }
        }`;

        const requestOptions: LoadCartRequestOptions = {
            ...options,
            headers: {
                ...options.headers,
                'Content-Type': 'application/json',
            },
            body: {
                query: graphQLQuery,
            },
        };

        return this._requestSender
            .post<LoadCartResponse>(url, {
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
