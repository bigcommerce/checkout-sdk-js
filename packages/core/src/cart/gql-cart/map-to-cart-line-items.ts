import { LineItemMap } from '../index';

import { GQLCartLineItems } from './gql-cart';
import mapToLineItem from './map-to-cart-line-item';

export default function mapToCartLineItems(lineItems: GQLCartLineItems): LineItemMap {
    const {
        physicalItems = [],
        digitalItems = [],
        giftCertificates = [],
        customItems = [],
    } = lineItems;

    return {
        physicalItems: physicalItems.map(({ isShippingRequired, giftWrapping, ...item }) => ({
            isShippingRequired,
            giftWrapping: giftWrapping
                ? {
                      message: giftWrapping.message,
                      name: giftWrapping.name,
                      amount: giftWrapping.amount.value,
                  }
                : undefined,
            ...mapToLineItem(item),
        })),
        digitalItems: digitalItems.map(
            ({ downloadFileUrls = [], downloadPageUrl = '', downloadSize = '', ...item }) => ({
                downloadFileUrls,
                downloadPageUrl,
                downloadSize,
                ...mapToLineItem(item),
            }),
        ),
        giftCertificates: giftCertificates.map((item) => ({
            id: item.entityId,
            name: item.name,
            theme: item.theme,
            amount: item.amount.value,
            taxable: item.isTaxable,
            sender: item.sender,
            recipient: item.recipient,
            message: item.message,
        })),
        customItems: customItems.map((item) => ({
            id: item.entityId,
            listPrice: item.listPrice.value,
            extendedListPrice: item.extendedListPrice.value,
            name: item.name,
            quantity: item.quantity,
            sku: item.sku,
        })),
    };
}
