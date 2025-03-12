import { LineItem } from '../line-item';

import { HeadlessLineItem } from './headless-cart';

export default function mapToLineItem(lineItem: HeadlessLineItem): LineItem {
    const {
        entityId,
        name,
        quantity,
        productEntityId,
        brand,
        couponAmount,
        discountedAmount,
        discounts,
        extendedListPrice,
        extendedSalePrice,
        imageUrl,
        isTaxable,
        listPrice,
        salePrice,
        sku,
        url,
        variantEntityId,
        selectedOptions,
    } = lineItem;

    return {
        id: entityId,
        name,
        quantity,
        productId: productEntityId,
        brand,
        couponAmount: couponAmount.value,
        discountAmount: discountedAmount.value,
        discounts: discounts.map((discount) => ({
            discountedAmount: discount.discountedAmount.value,
            // TODO:: discount item does not have name field in response body when making request using REST API, but there is name in interface, for a while set name as entityID
            name: discount.entityId,
        })),
        extendedListPrice: extendedListPrice.value,
        extendedSalePrice: extendedSalePrice.value,
        imageUrl,
        isTaxable,
        listPrice: listPrice.value,
        salePrice: salePrice.value,
        sku,
        url,
        variantId: variantEntityId,
        options: selectedOptions?.map((option) => ({
            name: option.name,
            nameId: option.entityId,
            value: option.value,
            valueId: option.valueEntityId,
        })),

        // TODO:: we do not have any information regarding to fields below in the GraphQL Storefront doc
        addedByPromotion: false,
        comparisonPrice: 0,
        extendedComparisonPrice: 0,
        retailPrice: 0,
    };
}
