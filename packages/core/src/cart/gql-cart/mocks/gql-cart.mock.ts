import { GQLCartLineItem, GQLCartResponse, GQLCurrencyResponse } from '../gql-cart';
import { GQLRequestResponse } from '../gql-request-response';

export function gqlCartLineItem(): GQLCartLineItem {
    return {
        discounts: [],
        brand: 'OFS',
        couponAmount: {
            value: 5,
        },
        discountedAmount: {
            value: 10,
        },
        entityId: '666',
        extendedListPrice: {
            value: 200,
        },
        extendedSalePrice: {
            value: 190,
        },
        imageUrl: '/images/canvas-laundry-cart.jpg',
        isTaxable: true,
        listPrice: {
            value: 200,
        },
        name: 'Canvas Laundry Cart',
        originalPrice: {
            value: 225,
        },
        productEntityId: 103,
        quantity: 1,
        salePrice: {
            value: 190,
        },
        selectedOptions: [
            {
                name: 'n',
                entityId: 1,
                value: 'v',
                valueEntityId: 3,
            },
        ],
        sku: 'CLC',
        url: '/canvas-laundry-cart/',
        variantEntityId: 71,
    };
}

export function getGQLCartResponse(): GQLRequestResponse<GQLCartResponse> {
    return {
        data: {
            site: {
                cart: {
                    amount: {
                        value: 190,
                    },
                    baseAmount: {
                        value: 200,
                    },
                    createdAt: {
                        utc: '2018-03-06T04:41:49+00:00',
                    },
                    updatedAt: {
                        utc: '2018-03-07T03:44:51+00:00',
                    },
                    currencyCode: 'USD',
                    discountedAmount: {
                        value: 10,
                    },
                    discounts: [
                        {
                            discountedAmount: {
                                value: 10,
                            },
                            entityId: '12e11c8f-7dce-4da3-9413-b649533f8bad',
                        },
                    ],
                    entityId: 'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
                    id: 'Q2FydDozOWE5NmQ2Yy1mNDRjLTQxZTItOTFlMy0yNTcxMDQ0Yzk1Njc=',
                    isTaxIncluded: false,
                    lineItems: {
                        customItems: [],
                        digitalItems: [],
                        physicalItems: [getPhysicalItem()],
                    },
                },
                checkout: {
                    coupons: [
                        {
                            entityId: '1',
                            code: 'savebig2015',
                            couponType: 'percentage_discount',
                            discountedAmount: {
                                value: 5,
                            },
                        },
                        {
                            entityId: '4',
                            code: '279F507D817E3E7',
                            couponType: 'shipping_discount',
                            discountedAmount: {
                                value: 5,
                            },
                        },
                    ],
                },
            },
        },
    };
}

export function getPhysicalItem(hasGiftWrapping?: false) {
    return {
        isShippingRequired: true,
        ...(hasGiftWrapping
            ? {
                  giftWrapping: {
                      name: 'gift',
                      message: 'message',
                      amount: {
                          value: 10,
                      },
                  },
              }
            : {}),
        ...gqlCartLineItem(),
    };
}

export function getGQLCurrencyResponse(): GQLRequestResponse<GQLCurrencyResponse> {
    return {
        data: {
            site: {
                currency: {
                    display: {
                        decimalPlaces: 2,
                        symbol: '$',
                    },
                    name: 'US Dollar',
                    code: 'USD',
                },
            },
        },
    };
}
