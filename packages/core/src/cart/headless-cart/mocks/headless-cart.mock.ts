import { HeadlessLineItem } from '../headless-cart';
import { HeadlessCartRequestResponse } from '../headless-cart-request-response';

export function headlessLineItem(): HeadlessLineItem {
    return {
        discounts: [],
        brand: 'null',
        couponAmount: {
            value: 0,
        },
        discountedAmount: {
            value: 0,
        },
        entityId: 'e9543890-76a5-4026-bb7d-5f4bebd68b9f',
        extendedListPrice: {
            value: 225,
        },
        extendedSalePrice: {
            value: 225,
        },
        imageUrl:
            'https://cdn.integration.zone/s-wbaqgkqmcy/products/86/images/286/ablebrewingsystem4.1736764752.220.290.jpg?c=1',
        isTaxable: true,
        listPrice: {
            value: 225,
        },
        name: '[Sample] Able Brewing System',
        originalPrice: {
            value: 225,
        },
        productEntityId: 86,
        quantity: 1,
        salePrice: {
            value: 225,
        },
        selectedOptions: [
            {
                name: 'Color',
                entityId: 114,
                __typename: 'CartSelectedMultipleChoiceOption',
                value: 'Green',
                valueEntityId: 102,
            },
            {
                name: 'Size',
                entityId: 115,
                __typename: 'CartSelectedMultipleChoiceOption',
                value: 'Medium',
                valueEntityId: 105,
            },
            {
                name: 'test',
                entityId: 116,
                __typename: 'CartSelectedMultipleChoiceOption',
                value: 'test1',
                valueEntityId: 107,
            },
        ],
        sku: 'ABS-GR-ME-TE',
        url: 'https://nicktsybulko1736764704-testly-the-third.my-integration.zone/able-brewing-system',
        variantEntityId: 89,
    };
}

export function getHeadlessCartResponse(): HeadlessCartRequestResponse {
    return {
        data: {
            site: {
                cart: {
                    amount: {
                        value: 225,
                    },
                    baseAmount: {
                        value: 225,
                    },
                    createdAt: {
                        utc: '2025-01-13T19:08:43Z',
                    },
                    updatedAt: {
                        utc: '2025-01-13T19:46:00Z',
                    },
                    currencyCode: 'USD',
                    discountedAmount: {
                        value: 0,
                    },
                    discounts: [
                        {
                            discountedAmount: {
                                value: 0,
                            },
                            entityId: 'e9543890-76a5-4026-bb7d-5f4bebd68b9f',
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
                            entityId: '123',
                            code: 'I534FA46H',
                            couponType: 'promotion',
                            discountedAmount: {
                                value: 10,
                            },
                        },
                    ],
                },
            },
        },
    };
}

export function getPhysicalItem() {
    return {
        isShippingRequired: true,
        giftWrapping: {
            name: 'gift',
            message: 'message',
            amount: {
                value: 10,
            },
        },
        ...headlessLineItem(),
    };
}
